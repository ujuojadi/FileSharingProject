package main

import (
	"bytes"
	"encoding/gob"
	"fmt"
	"github.com/ujuojadi/PersonalFileS/p2p"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

/* =========================
   SERVER STRUCTS
========================= */

type ServerOpts struct {
	ListenAddr         string
	StorageRoot        string
	PathTransformFunc PathTransformFunc
	Transport          p2p.Transport
	TCPTransportOpts  p2p.TCPTransportOpts
	BootstrapNodes    []string
}

type FileServer struct {
	opts     ServerOpts
	peerLock sync.Mutex
	peers    map[string]p2p.Peer
	store    *Store
	quitch   chan struct{}
}

func NewFileServer(opts ServerOpts) *FileServer {
	storeOpts := StoreOpts{
		Root:              opts.StorageRoot,
		PathTransformFunc: opts.PathTransformFunc,
	}
	return &FileServer{
		opts:   opts,
		store:  NewStore(storeOpts),
		quitch: make(chan struct{}),
		peers:  make(map[string]p2p.Peer),
	}
}

/* =========================
   MESSAGE TYPES
========================= */

type Message struct {
	Payload any
}

type MessageStoreFile struct {
	Key  string
	Size int64
}

type MessageGetFile struct {
	Key string
}

/* =========================
   FILE OPERATIONS
========================= */

func (s *FileServer) Get(key string) (io.Reader, error) {
	if s.store.Has(key) {
		fmt.Printf("File (%s) found in local P2P storage\n", key)
		return s.store.Read(key)
	}
	return nil, fmt.Errorf("file not found in P2P storage")
}

func (s *FileServer) Store(key string, r io.Reader) error {
	fileBuffer := new(bytes.Buffer)
	tee := io.TeeReader(r, fileBuffer)

	size, err := s.store.Write(key, tee)
	if err != nil {
		return err
	}

	msg := Message{
		Payload: MessageStoreFile{Key: key, Size: size},
	}
	if err := s.broadcast(&msg); err != nil {
		return err
	}

	time.Sleep(time.Millisecond * 5)

	for _, peer := range s.peers {
		peer.Send([]byte{p2p.IncomingStream})
		n, err := io.Copy(peer, bytes.NewReader(fileBuffer.Bytes()))
		if err != nil {
			return err
		}
		fmt.Printf("replicated %d bytes to peer\n", n)
	}

	return nil
}

/* =========================
   P2P MESSAGE HANDLING
========================= */

func (s *FileServer) handleMessage(from string, m *Message) error {
	switch v := m.Payload.(type) {
	case MessageStoreFile:
		return s.handleMessageStoreFile(from, v)
	case MessageGetFile:
		return s.handleMessageGetFile(from, v)
	}
	return nil
}

func (s *FileServer) handleMessageGetFile(from string, msg MessageGetFile) error {
	r, err := s.store.Read(msg.Key)
	if err != nil {
		return err
	}

	peer := s.peers[from]
	n, err := io.Copy(peer, r)
	if err != nil {
		return err
	}

	fmt.Printf("written %d bytes over network to %s\n", n, from)
	return nil
}

func (s *FileServer) handleMessageStoreFile(from string, msg MessageStoreFile) error {
	peer := s.peers[from]

	n, err := s.store.Write(msg.Key, io.LimitReader(peer, msg.Size))
	if err != nil {
		return err
	}

	fmt.Printf("[%s] written %d bytes to disk\n", s.opts.Transport.Addr(), n)
	peer.CloseStream()
	return nil
}

/* =========================
   PEER MANAGEMENT
========================= */

func (s *FileServer) OnPeer(p p2p.Peer) error {
	s.peerLock.Lock()
	defer s.peerLock.Unlock()
	s.peers[p.RemoteAddr().String()] = p
	log.Printf("connected with remote %s", p.RemoteAddr())
	return nil
}

func (s *FileServer) broadcast(msg *Message) error {
	buf := new(bytes.Buffer)
	gob.NewEncoder(buf).Encode(msg)

	for _, peer := range s.peers {
		peer.Send([]byte{p2p.IncomingMessage})
		peer.Send(buf.Bytes())
	}
	return nil
}

/* =========================
   HTTP FILE SERVER ✅✅✅
========================= */

func (s *FileServer) StartHTTP(addr string) {
	mux := http.NewServeMux()

	mux.HandleFunc("/files/", func(w http.ResponseWriter, r *http.Request) {
		key := strings.TrimPrefix(r.URL.Path, "/files/")
		if key == "" {
			http.Error(w, "missing file id", http.StatusBadRequest)
			return
		}

		reader, err := s.Get(key)
		if err != nil {
			http.Error(w, "file not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set(
			"Content-Disposition",
			fmt.Sprintf(`attachment; filename="%s"`, key),
		)

		n, err := io.Copy(w, reader)
		if err != nil {
			log.Println("HTTP send error:", err)
			return
		}

		log.Printf("✅ HTTP served %d bytes for %s\n", n, key)
	})

	log.Println("✅ HTTP FILE SERVER RUNNING ON", addr)
	go http.ListenAndServe(addr, mux)
}
/* =========================
   MAIN EVENT LOOP
========================= */

func (s *FileServer) Start() error {
	if err := s.opts.Transport.ListenAndAccept(); err != nil {
		return err
	}

	s.bootstrapNetwork()
	go s.StartHTTP(":9000")

	s.loop()
	return nil
}

func (s *FileServer) loop() {
	for {
		select {
		case rpc := <-s.opts.Transport.Consume():
			var m Message
			gob.NewDecoder(bytes.NewReader(rpc.Payload)).Decode(&m)
			s.handleMessage(rpc.From, &m)
		case <-s.quitch:
			return
		}
	}
}

/* =========================
   NETWORK BOOTSTRAP
========================= */

func (s *FileServer) bootstrapNetwork() {
	for _, addr := range s.opts.BootstrapNodes {
		go s.opts.Transport.(*p2p.TCPTransport).Dial(addr)
	}
}

/* =========================
   INIT
========================= */

func init() {
	gob.Register(MessageStoreFile{})
	gob.Register(MessageGetFile{})
}
func (s *FileServer) Delete(key string) error {
	// Delete file from local P2P storage
	if !s.store.Has(key) {
		return fmt.Errorf("file with key %s not found in local storage", key)
	}

	// Delete from disk
	if err := s.store.Delete(key); err != nil {
		return fmt.Errorf("failed to delete file: %v", err)
	}

	// (Optional) Broadcast delete to peers later if needed
	fmt.Printf("✅ File (%s) deleted from local P2P storage\n", key)
	return nil
}

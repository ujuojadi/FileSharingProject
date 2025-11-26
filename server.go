package main

import(
	 "github.com/ujuojadi/PersonalFileS/p2p"
	 "log"
	 "fmt"
	 "sync"
	 "io"
	  "encoding/gob"
	 "bytes"
	 "time"
	 
	 
	)


type ServerOpts struct {
	ListenAddr string
	StorageRoot string
	PathTransformFunc PathTransformFunc
	Transport  p2p.Transport
	TCPTransportOpts p2p.TCPTransportOpts
	BootstrapNodes  []string
}

type FileServer struct {
	opts  ServerOpts

	peerLock sync.Mutex
	peers map[string]p2p.Peer
	store *Store
	quitch chan struct {}
}


func NewFileServer(opts ServerOpts) *FileServer {
	storeOpts :=StoreOpts {
		Root:                  opts.StorageRoot,
		PathTransformFunc:     opts.PathTransformFunc,
	}
	return &FileServer {
		opts:   opts,
		store:  NewStore(storeOpts),
		quitch: make(chan struct {}),
		peers: make(map[string]p2p.Peer),
	}
}



func (s *FileServer) stream(msg *Message) error{
	peers := []io.Writer{}
	for _, peer :=range s.peers {
		peers=append(peers, peer)

		
	}

	mw:=io.MultiWriter(peers...)
	return gob.NewEncoder(mw).Encode(msg)
	
	
}


func (s *FileServer) broadcast(msg *Message)error {
	buf :=new(bytes.Buffer)
	if err :=gob.NewEncoder(buf).Encode(msg); err !=nil {
		return err
	}
	for _, peer :=range s.peers{
		peer.Send([]byte{p2p.IncomingMessage})
		if err := peer.Send(buf.Bytes()); err !=nil{
			return err
		}

   }
   return nil
}

type Message struct {
	//From string
	Payload any
}

type MessageStoreFile struct {
	Key string
	Size int64
}

type MessageGetFile struct {
	Key string
}
func (s *FileServer) Delete(key string) error {
	// Delete file from local P2P storage
	if !s.store.Has(key) {
		return fmt.Errorf("file with key %s not found in local storage", key)
	}
	
	// Delete from local storage
	if err := s.store.Delete(key); err != nil {
		return fmt.Errorf("failed to delete file: %v", err)
	}
	
	// Broadcast deletion to peers (optional - for consistency)
	// In a full implementation, you'd broadcast a delete message to peers
	fmt.Printf("File (%s) deleted from local P2P storage\n", key)
	return nil
}

func (s *FileServer) Get(key string) (io.Reader, error){
	// Check local P2P node storage first
	if s.store.Has(key){
		fmt.Printf("File (%s) found in local P2P storage\n", key)
		return s.store.Read(key)
	}
	
	// File not found locally - request from P2P network peers
	fmt.Printf("File (%s) not found locally, requesting from P2P network peers...\n", key)

	// If no peers, can't retrieve from network
	if len(s.peers) == 0 {
		return nil, fmt.Errorf("file not found locally and no peers available in P2P network")
	}

	// Broadcast request to all peers in the P2P network
	msg := Message {
		Payload: MessageGetFile{
			Key: key,
		},
	}

	if err := s.broadcast(&msg); err != nil {
		return nil, fmt.Errorf("failed to broadcast to P2P network: %v", err)
	}

	// Note: In a full implementation, we'd use channels/goroutines to wait for peer response
	// Since files are automatically replicated on upload (Store() sends to all peers),
	// files should exist on at least one peer. The handleMessageGetFile method
	// handles serving files to requesting peers.
	
	// For now, return error if not found locally
	// In production, implement proper async waiting for peer response
	return nil, fmt.Errorf("file not found in local P2P storage. Note: Files are replicated on upload, so they should exist on at least one node")
}

func(s *FileServer) Store(key string, r io.Reader)error {
	var (
         fileBuffer =new(bytes.Buffer)
	     tee = io.TeeReader(r, fileBuffer)
	)
	
	size, err:=s.store.Write(key, tee)
	if err!=nil{
		return err
	 }
	

	msg :=Message{
		Payload:MessageStoreFile{
			Key: key,
			Size:size,
		},
	}
	
	if err :=s.broadcast(&msg);  err !=nil {
		return err
	}


	time.Sleep(time.Millisecond * 5)

	//TODO (USE A MUTIWRITER)
	for _, peer :=range s.peers{
		peer.Send([]byte{p2p.IncomingStream})
		n, err := io.Copy(peer, fileBuffer)
		if err !=nil {
			return err
		
		}
		fmt.Println("received and written bytes to disk", n)
		
	}

	return nil
	
	// // _, err :=io.Copy(buf, r)
	// // if err!=nil {
	// // 	return err
	// // }

	// p := &DataMessage{
	// 	Key: key,
	// 	Data: buf.Bytes(),
	// }

	// return s.broadcast(&Message{
	// 	From: "todo",
	// 	Payload: p,
	// })
}



func (s *FileServer) Stop(){
	close(s.quitch)
}

func (s *FileServer) OnPeer(p p2p.Peer)  error {
	s.peerLock.Lock()
	defer s.peerLock.Unlock()
	s.peers[p.RemoteAddr().String()] =p

	log.Printf("connected with remote %s", p.RemoteAddr())

	return nil

}

func (s *FileServer) loop(){
	defer func (){
		log.Println("file server stopped due to error or  user quit action")
		s.opts.Transport.Close()
	}()

	for {
		select {
		case rpc :=<- s.opts.Transport.Consume():
			fmt.Println("recv msg")
			var m Message
            decoder := gob.NewDecoder(bytes.NewReader(rpc.Payload))
            if err := decoder.Decode(&m); err != nil {
                log.Println("decoding error", err)
                
			
		}
		if err := s.handleMessage(rpc.From, &m); err!=nil {
			log.Println("handling message", err)
			return 
		}
		
		
		case <- s.quitch:
		    return
		}
	}
}

func ( s *FileServer) handleMessage(from string, m *Message) error {
	switch v:=m.Payload.(type){
	case MessageStoreFile:
		return s.handleMessageStoreFile(from, v)
	case MessageGetFile:
		return s.handleMessageGetFile(from, v)
	}
	return nil

}

func (s *FileServer) handleMessageGetFile(from string, msg MessageGetFile)error{
	if !s.store.Has(msg.Key){
		log.Printf("need to serve file but it (%s) does not exist on disk\n", msg.Key)
	}

	fmt.Printf("got file (%s) serving over the network", msg.Key)
	r, err :=s.store.Read(msg.Key)
	if err!=nil{
		return err
	}

	peer, ok :=s.peers[from]
	if !ok {
		return fmt.Errorf("peer %s not in map", from)
	}

	n, err :=io.Copy(peer, r)
	if err!=nil{
		return err
	}

	fmt.Printf("written %d bytes over the network to %s\n", n, from)

	return nil
}

func (s *FileServer)handleMessageStoreFile(from string, msg MessageStoreFile) error {
	peer, ok :=s.peers[from]
	if !ok {
		return fmt.Errorf("peer  (%s) could not be found in the peer list", from)
	}
	n, err :=s.store.Write(msg.Key, io.LimitReader(peer, msg.Size))
	if err!=nil {
		return err
	}

	fmt.Printf("[%s] written %d bytes to disk\n", s.opts.Transport.Addr(), n)

	//peer.(*p2p.TCPPeer).Wg.Done()
	peer.CloseStream()
	return nil 
		

}


func(s *FileServer) bootstrapNetwork() error {
	for _, addr := range s.opts.BootstrapNodes {
		if len(addr) == 0 {
			continue
		}
		go func (addr string ) {
		    fmt.Println("attempting to connect with remote", addr)
		
			//if err :=s.opts.Transport.Dial(addr); err !=nil{
				//log.Println("dial error:", err)
			//}
			tcpTrans, ok := s.opts.Transport.(*p2p.TCPTransport)
			if !ok {
				log.Println("transport is not TCPTransport, cannot dial")
				return
			}

			if err := tcpTrans.Dial(addr); err != nil {
				log.Println("dial error:", err)
			}
		}(addr)
		
	}
	return nil
}
func (s *FileServer) Start() error{
	if err:=s.opts.Transport.ListenAndAccept(); err !=nil{
		return err
	}

	if len(s.opts.BootstrapNodes) !=0{
		s.bootstrapNetwork()
	}

	s.bootstrapNetwork()

	s.loop()
	return nil

}

func init() {
	gob.Register(MessageStoreFile{})
	gob.Register(MessageGetFile{})
}
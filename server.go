package main

import(
     "github.com/ujuojadi/FileSharingProject/p2p"
     "log"
     "fmt"
     "sync"
     "io"
      "encoding/gob"
     "bytes"
     "time"
     "encoding/binary"
     "os"
     
     
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

    peerLock sync.RWMutex
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
    payload := buf.Bytes()
    s.peerLock.RLock()
    defer s.peerLock.RUnlock()
    for _, peer :=range s.peers{
        // control byte
        if err := peer.Send([]byte{p2p.IncomingMessage}); err != nil {
            return err
        }
        // 4-byte big-endian length
        lenBuf := make([]byte, 4)
        binary.BigEndian.PutUint32(lenBuf, uint32(len(payload)))
        if err := peer.Send(lenBuf); err != nil {
            return err
        }
        // payload
        if err := peer.Send(payload); err != nil{
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
func (s *FileServer) Get(key string) (io.Reader, error){
	if s.store.Has(key){
		return s.store.Read(key)
	}
   fmt.Printf("Dont have file (%s) locally...\n", key)

	msg :=Message {
		Payload: MessageGetFile{
			Key:key,
		},
	}

	if err :=s.broadcast(&msg); err !=nil{
		return nil, err
	}
    // Wait for a peer to start a stream and read size-prefixed content
    timeout := time.After(5 * time.Second)
    s.peerLock.RLock()
    peersSnapshot := make([]p2p.Peer, 0, len(s.peers))
    for _, p := range s.peers { peersSnapshot = append(peersSnapshot, p) }
    s.peerLock.RUnlock()

    for _, peer := range peersSnapshot {
        // Try to read a stream control byte
        ctrl := make([]byte, 1)
        peer.SetReadDeadline(time.Now().Add(2 * time.Second))
        if _, err := io.ReadFull(peer, ctrl); err != nil {
            continue
        }
        if ctrl[0] != p2p.IncomingStream {
            continue
        }
        // Read 8-byte big-endian length
        var size uint64
        if err := binary.Read(peer, binary.BigEndian, &size); err != nil {
            return nil, err
        }
        fileBuffer := new(bytes.Buffer)
        if _, err := io.CopyN(fileBuffer, peer, int64(size)); err != nil {
            return nil, err
        }
        return fileBuffer, nil
    }

    select {
    case <-timeout:
        return nil, fmt.Errorf("timeout waiting for stream")
    }
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

func (s *FileServer) OnPeerDisconnected(p p2p.Peer) error {
    s.peerLock.Lock()
    defer s.peerLock.Unlock()
    addr := p.RemoteAddr().String()
    if _, ok := s.peers[addr]; ok {
        delete(s.peers, addr)
        log.Printf("disconnected remote %s (removed from peers)", addr)
    }
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
    // Open file stream and determine size
    s.peerLock.RLock()
    peer, ok :=s.peers[from]
    s.peerLock.RUnlock()
	if !ok {
		return fmt.Errorf("peer %s not in map", from)
	}
    // Use internal readStream to get *os.File for stat and streaming
    f, err := s.store.readStream(msg.Key)
    if err != nil {
        return err
    }
    defer f.Close()
    // Determine size
    var size int64
    if of, ok := f.(*os.File); ok {
        if fi, err := of.Stat(); err == nil {
            size = fi.Size()
        }
    }
    // Signal stream and send size (8 bytes), then content
    if err := peer.Send([]byte{p2p.IncomingStream}); err != nil {
        return err
    }
    if err := binary.Write(peer, binary.BigEndian, uint64(size)); err != nil {
        return err
    }
    n, err := io.Copy(peer, f)
    if err != nil {
        return err
    }
    fmt.Printf("written %d bytes over the network to %s\n", n, from)
    peer.CloseStream()
    return nil
}

func (s *FileServer)handleMessageStoreFile(from string, msg MessageStoreFile) error {
    s.peerLock.RLock()
    peer, ok :=s.peers[from]
    s.peerLock.RUnlock()
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

	s.loop()
	return nil

}

func init() {
	gob.Register(MessageStoreFile{})
	gob.Register(MessageGetFile{})
}
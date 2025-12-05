package p2p

import (
	"errors"
	"fmt"
	"log"
	"net"
	"sync"
)

// TCPPeer represents the remote node over a TCP established connection.
type TCPPeer struct {
	net.Conn
	outbound bool
	wg       *sync.WaitGroup

	mu           sync.Mutex
	streamActive bool
}

func NewTCPPeer(conn net.Conn, outbound bool) *TCPPeer {
	return &TCPPeer{
		Conn:         conn,
		outbound:     outbound,
		wg:           &sync.WaitGroup{},
		streamActive: false,
	}
}

// CloseStream safely ends the active stream without risking a negative WaitGroup
func (p *TCPPeer) CloseStream() {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.streamActive {
		p.streamActive = false
		p.wg.Done()
	}
}

func (p *TCPPeer) Send(b []byte) error {
	_, err := p.Conn.Write(b)
	return err
}

func (p *TCPPeer) Close() error {
	return p.Conn.Close()
}

func (p *TCPPeer) RemoteAddr() net.Addr {
	return p.Conn.RemoteAddr()
}

type TCPTransportOpts struct {
	ListenAddr    string
	HandshakeFunc HandshakeFunc
	Decoder       Decoder
	OnPeer        func(Peer) error
}

type TCPTransport struct {
	TCPTransportOpts
	listener net.Listener
	rpcch    chan RPC
}

func NewTCPTransport(opts TCPTransportOpts) *TCPTransport {
	return &TCPTransport{
		TCPTransportOpts: opts,
		rpcch:            make(chan RPC, 1024),
	}
}

func (t *TCPTransport) Addr() string {
	return t.ListenAddr
}

func (t *TCPTransport) Consume() <-chan RPC {
	return t.rpcch
}

func (t *TCPTransport) Close() error {
	return t.listener.Close()
}

func (t *TCPTransport) Dial(addr string) error {
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return err
	}
	go t.handleConn(conn, true)
	return nil
}

func (t *TCPTransport) ListenAndAccept() error {
	var err error
	t.listener, err = net.Listen("tcp", t.ListenAddr)
	if err != nil {
		return err
	}

	go t.startAcceptLoop()
	log.Printf("TCP transport listening on port: %s\n", t.ListenAddr)
	return nil
}

func (t *TCPTransport) startAcceptLoop() {
	for {
		conn, err := t.listener.Accept()
		if errors.Is(err, net.ErrClosed) {
			return
		}
		if err != nil {
			fmt.Printf("TCP accept error: %s\n", err)
			continue
		}

		fmt.Printf("new incoming connection %+v\n", conn)
		go t.handleConn(conn, false)
	}
}

func (t *TCPTransport) handleConn(conn net.Conn, outbound bool) {
	var err error

	defer func() {
		fmt.Printf("dropping peer connection: %v\n", err)
		conn.Close()
	}()

	peer := NewTCPPeer(conn, outbound)

	if err = t.HandshakeFunc(peer); err != nil {
		return
	}

	if t.OnPeer != nil {
		if err = t.OnPeer(peer); err != nil {
			return
		}
	}

	// Read Loop
	for {
		rpc := RPC{}
		err = t.Decoder.Decode(conn, &rpc)
		if err != nil {
			return
		}

		rpc.From = conn.RemoteAddr().String()

		if rpc.Stream {
			peer.mu.Lock()
			if !peer.streamActive {
				peer.streamActive = true
				peer.wg.Add(1)
			}
			peer.mu.Unlock()

			fmt.Printf("[%s] incoming stream, waiting\n", conn.RemoteAddr())
			peer.wg.Wait()
			fmt.Printf("[%s] incoming stream finished\n", conn.RemoteAddr())
			continue
		}

		t.rpcch <- rpc
	}
}
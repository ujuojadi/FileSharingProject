package p2p

import "net"

// Peer is an interface that represents the remot node
type Peer interface {
    net.Conn
    Send([]byte) error
    CloseStream()
    

}

//Transport  is anything that handles communicatio between the nodes in the network
//This can be of the form TCP or UDP
type Transport interface{
    Addr() string
    Dial(string)error
    ListenAndAccept()error
    Consume () <- chan RPC
    Close() error
    
}
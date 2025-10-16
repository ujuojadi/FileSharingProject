package p2p

const (
    IncomingMessage = 0x1
    IncomingStream = 0x2
)

//MESSage represents any arbitrary data that is being sent over each transport betwenn two nodes in the network
type RPC struct {
    From    string
    Payload []byte
    Stream bool
}
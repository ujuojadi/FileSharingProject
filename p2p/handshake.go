package p2p

import "errors"

//ErrinvalidHandshake is returned if the handshake betwenn the local and remote note could not be established.


var ErrInvalidHandshake = errors.New("invalid Handshake")

type HandshakeFunc func(Peer) error

func NOPHandshakeFunc(Peer) error {return nil}

//type DefaultHandshaker struct {}
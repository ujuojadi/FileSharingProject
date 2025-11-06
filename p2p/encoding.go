package p2p

import (
     "encoding/binary"
     "encoding/gob"
     "io"
)

type Decoder interface {
	Decode(io.Reader, *RPC) error
}

type GOBDecoder struct {}

func (dec GOBDecoder) Decode(r io.Reader, msg *RPC) error{
    return gob.NewDecoder(r).Decode(msg)
}

type DefaultDecoder struct{}

func (dec DefaultDecoder) Decode(r io.Reader, msg *RPC) error{
    // Read the first control byte
    ctrl := make([]byte, 1)
    if _, err := io.ReadFull(r, ctrl); err != nil {
        return err
    }

    if ctrl[0] == IncomingStream {
        msg.Stream = true
        return nil
    }

    // IncomingMessage: next 4 bytes are length (big-endian), followed by payload
    var length uint32
    if err := binary.Read(r, binary.BigEndian, &length); err != nil {
        return err
    }
    if length == 0 {
        msg.Payload = nil
        return nil
    }
    buf := make([]byte, int(length))
    if _, err := io.ReadFull(r, buf); err != nil {
        return err
    }
    msg.Payload = buf
    return nil
}

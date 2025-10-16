package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strings"
    "time"

    "github.com/ujuojadi/FileSharingProject/p2p"
)

// -------- Helper functions --------

func makeServer(listenAddr string, nodes ...string) *FileServer {
    tcptransportOpts := p2p.TCPTransportOpts{
        ListenAddr:    listenAddr,
        HandshakeFunc: p2p.NOPHandshakeFunc,
        Decoder:       p2p.DefaultDecoder{},
    }

    tcpTransport := p2p.NewTCPTransport(tcptransportOpts)
    safeRoot := strings.ReplaceAll(listenAddr, ":", "_")

    fileServerOpts := ServerOpts{
        StorageRoot:       safeRoot + "_network",
        PathTransformFunc: CASPathTransformFunc,
        Transport:         tcpTransport,
        BootstrapNodes:    nodes,
    }

    s := NewFileServer(fileServerOpts)
    tcpTransport.OnPeer = s.OnPeer
    return s
}

// This starts the demo P2P network
func startDemoNetwork() {
    s1 := makeServer(":3000", "")
    s2 := makeServer(":4000", ":3000")

    go func() {
        log.Fatal(s1.Start())
    }()

    time.Sleep(1 * time.Second)
    go s2.Start()

    // Store example data
    for i := 0; i < 5; i++ {
        data := bytes.NewReader([]byte(fmt.Sprintf("sample data %d", i)))
        s2.Store(fmt.Sprintf("file_%d", i), data)
        time.Sleep(50 * time.Millisecond)
    }

    fmt.Println("🟢 P2P network started (ports 3000 & 4000)")
}

// -------- HTTP Handlers --------

// ✅ New root route — avoids 404 when you visit localhost:8081
func rootHandler(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Welcome to Go P2P File Sharing Service"))
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "Go P2P service running"})
}

func startHandler(w http.ResponseWriter, r *http.Request) {
    go startDemoNetwork() // run the P2P in background
    json.NewEncoder(w).Encode(map[string]string{"message": "P2P network started"})
}

// -------- main() --------

func main() {
    http.HandleFunc("/", rootHandler)        // 👈 add this line
    http.HandleFunc("/status", statusHandler)
    http.HandleFunc("/start", startHandler)

    fmt.Println("✅ Go backend running on http://127.0.0.1:8081")
    log.Fatal(http.ListenAndServe(":8081", nil))
}

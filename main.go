package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ujuojadi/FileSharingProject/p2p"
)

// -------- Configuration --------

var (
	httpPort      = flag.String("http", "", "HTTP server port (env: HTTP_PORT, default: 8081)")
	p2pAddr       = flag.String("p2p", "", "P2P listen address (env: P2P_ADDR, default: :3000)")
	bootstrapNode = flag.String("bootstrap", "", "Bootstrap node address (env: BOOTSTRAP_NODE, e.g., :3000)")
)

// getConfig returns the value from env var, flag, or default
func getConfig(envKey, flagValue, defaultValue string) string {
	if envValue := os.Getenv(envKey); envValue != "" {
		return envValue
	}
	if flagValue != "" {
		return flagValue
	}
	return defaultValue
}

// -------- Helper functions --------

var gServer *FileServer

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
	tcpTransport.OnPeerDisconnected = s.OnPeerDisconnected
	return s
}

// This starts the demo P2P network
func startDemoNetwork() {
	p2pListenAddr := getConfig("P2P_ADDR", *p2pAddr, ":3000")
	bootstrapAddr := getConfig("BOOTSTRAP_NODE", *bootstrapNode, "")

	var bootstrapNodes []string
	if bootstrapAddr != "" {
		bootstrapNodes = []string{bootstrapAddr}
	}

	s := makeServer(p2pListenAddr, bootstrapNodes...)
	go func() {
		log.Fatal(s.Start())
	}()
	gServer = s

	time.Sleep(500 * time.Millisecond)
	fmt.Printf("🟢 P2P network started on %s\n", p2pListenAddr)
}

// -------- HTTP Handlers --------

// Root route handler
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

// Upload a file: POST /files?key=...
func uploadHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "missing key", http.StatusBadRequest)
		return
	}
	if gServer == nil {
		// start a default single node
		p2pListenAddr := getConfig("P2P_ADDR", *p2pAddr, ":3000")
		bootstrapAddr := getConfig("BOOTSTRAP_NODE", *bootstrapNode, "")
		var bootstrapNodes []string
		if bootstrapAddr != "" {
			bootstrapNodes = []string{bootstrapAddr}
		}
		gServer = makeServer(p2pListenAddr, bootstrapNodes...)
		go func() { log.Fatal(gServer.Start()) }()
		time.Sleep(500 * time.Millisecond)
	}
	if err := gServer.Store(key, r.Body); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"key": key})
}

// Download a file: GET /files?key=...
func downloadHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "missing key", http.StatusBadRequest)
		return
	}
	if gServer == nil {
		http.Error(w, "server not started; call /start first", http.StatusServiceUnavailable)
		return
	}
	reader, err := gServer.Get(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusOK)
	if _, err := io.Copy(w, reader); err != nil {
		log.Println("download write error:", err)
	}
}

// -------- main() --------

func main() {
	flag.Parse()

	// Get config values (env vars override defaults, flags override env vars)
	httpPortValue := getConfig("HTTP_PORT", *httpPort, "8081")

	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/status", statusHandler)
	http.HandleFunc("/start", startHandler)
	http.HandleFunc("/files", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			uploadHandler(w, r)
		case http.MethodGet:
			downloadHandler(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	addr := ":" + httpPortValue
	fmt.Printf("✅ Go backend running on http://127.0.0.1%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

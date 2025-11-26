// package main

// import (
//     "crypto/sha256"
//      "github.com/ujuojadi/PersonalFileS/p2p"
// 	 "log"
// 	 "strings"
// 	 "fmt"
//     "net/http"
// 	"time"
//     "io"
//     "os"
//      "encoding/json" 
   
//     "path/filepath"
      
//       "mime"
//       "strconv"
//     "github.com/google/uuid"
   
// )

	 
// func enableCORS(h http.Handler) http.Handler {
//     return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//         w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
//         w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
//         w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

//         if r.Method == http.MethodOptions {
//             w.WriteHeader(http.StatusOK)
//             return
//         }

//         h.ServeHTTP(w, r)
//     })
// }

	

// func makeServer(listenAddr string, nodes ...string ) *FileServer {
// 	tcptransportOpts :=p2p.TCPTransportOpts {
// 		ListenAddr: listenAddr,
// 		HandshakeFunc :p2p.NOPHandshakeFunc,
// 		Decoder: p2p.DefaultDecoder{},
		
// 	}
// 	tcpTransport :=p2p.NewTCPTransport(tcptransportOpts)
    

// 	safeRoot := strings.ReplaceAll(listenAddr, ":", "_")
// 	fileServerOpts :=ServerOpts{
// 		StorageRoot : safeRoot + "_network",
// 		PathTransformFunc: CASPathTransformFunc,
// 		Transport: tcpTransport, 
// 		BootstrapNodes: nodes,

// 	}
// 	s:= NewFileServer(fileServerOpts)
//     tcpTransport.OnPeer = s.OnPeer

// return s
 
	
// }



// func uploadHandler(s *FileServer) http.HandlerFunc {
//     return func(w http.ResponseWriter, r *http.Request) {
//         file, header, err := r.FormFile("file")
//         if err != nil {
//             http.Error(w, err.Error(), http.StatusBadRequest)
//             return
//         }
//         defer file.Close()

//         // Compute SHA256 hash for CAS
//         file.Seek(0, io.SeekStart) // rewind
//         hasher := sha256.New()
//         io.Copy(hasher, file)
//         hash := fmt.Sprintf("%x", hasher.Sum(nil))

//         file.Seek(0, io.SeekStart) // rewind again before storing
//         err = s.Store(header.Filename, file)
//         if err != nil {
//             http.Error(w, err.Error(), http.StatusInternalServerError)
//             return
//         }

//         // Create manifest
//         meta := FileMetadata{
//             Hash:       hash,
//             Filename:   header.Filename,
//             Size:       header.Size,
//             Uploader:   "user123",
//             Course:     "CS101",
//             UploadedAt: time.Now().Format(time.RFC3339),
//         }

//         os.MkdirAll("manifests", os.ModePerm)
//         manifestPath := fmt.Sprintf("manifests/%s.json", meta.Filename)
//         data, _ := json.Marshal(meta)
//         os.WriteFile(manifestPath, data, 0644)

//         w.Write([]byte("uploaded"))
//     }
// }
// // File metadata struct
// type FileMetadata struct {
//     Hash       string `json:"hash"`
//     Filename   string `json:"filename"`
//     Size       int64  `json:"size"`
//     Uploader   string `json:"uploader"`
//     Course     string `json:"course"`
//     UploadedAt string `json:"uploaded_at"`
// }

// // List files handler
// type FileResponse struct {
//     ID          string `json:"id"`
//     Name        string `json:"name"`
//     Size        int64  `json:"size"`
//     CourseCode  string `json:"courseCode"`
//     CourseName  string `json:"courseName"`
//     Description string `json:"description"`
//     Type        string `json:"type"`
//     UploadedAt  string `json:"uploadedAt"`
// }



// ///all of download




// type File struct {
//     ID          string `json:"ID"`
//     Name        string `json:"Name"`
//     Size        int64  `json:"Size"`
//     Type        string `json:"Type"`
//     CourseCode  string `json:"CourseCode,omitempty"`
//     CourseName  string `json:"CourseName,omitempty"`
//     Description string `json:"description,omitempty"`
//     UploadedAt  int64  `json:"uploadedAt"`
// }

// // Directories for P2P networks
// var networkDirs = []string{
//     "_5000_network",
//     "_5002_network",
// }

// // Map to keep track of file IDs to paths
// var fileIndex = map[string]string{}

// // helper to detect mime type
// func detectMimeType(filename string) string {
//     ext := strings.ToLower(filepath.Ext(filename))
//     if ext != "" {
//         mimeType := mime.TypeByExtension(ext)
//         if mimeType != "" {
//             return mimeType
//         }
//     }
//     return "application/octet-stream"
// }


// func indexFiles() ([]File, error) {
//     var allFiles []File
//     fileIndex = map[string]string{} // reset

//     for _, netDir := range networkDirs {
//         root := filepath.Join(".", netDir)
//         err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
//             if err != nil {
//                 return nil
//             }
//             if !info.IsDir() {
//                 id := uuid.New().String()
//                 fileIndex[id] = path

//                 // Try to find the manifest
//                 manifestPath := filepath.Join("manifests", info.Name()+".json")
//                 originalName := info.Name() // fallback
//                 if data, err := os.ReadFile(manifestPath); err == nil {
//                     var meta FileMetadata
//                     if err := json.Unmarshal(data, &meta); err == nil {
//                         originalName = meta.Filename
//                     }
//                 }

//                 file := File{
//                     ID:         id,
//                     Name:       originalName, // use the original filename
//                     Size:       info.Size(),
//                     Type:       detectMimeType(originalName),
//                     UploadedAt: info.ModTime().Unix(),
//                 }
//                 allFiles = append(allFiles, file)
//             }
//             return nil
//         })
//         if err != nil {
//             return nil, err
//         }
//     }

//     return allFiles, nil
// }



// // HTTP handler: list all files
// func listFilesHandler(w http.ResponseWriter, r *http.Request) {
//     files, err := indexFiles()
//     if err != nil {
//         http.Error(w, "Failed to scan files", http.StatusInternalServerError)
//         return
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(files)
// }

// // HTTP handler: download by ID
// func downloadFileHandler(w http.ResponseWriter, r *http.Request) {
//     id := r.URL.Query().Get("id")
//     if id == "" {
//         http.Error(w, "Missing file ID", http.StatusBadRequest)
//         return
//     }

//     path, ok := fileIndex[id]
//     if !ok {
//         http.Error(w, "File not found", http.StatusNotFound)
//         return
//     }

//     file, err := os.Open(path)
//     if err != nil {
//         http.Error(w, "Cannot open file", http.StatusInternalServerError)
//         return
//     }
//     defer file.Close()

//     fi, _ := file.Stat()
//     mimeType := detectMimeType(fi.Name())
//     w.Header().Set("Content-Disposition", "attachment; filename="+fi.Name())
//     w.Header().Set("Content-Type", mimeType)
//     w.Header().Set("Content-Length", strconv.FormatInt(fi.Size(), 10))

//     io.Copy(w, file)
// }





// func main() {
//     s1 := makeServer(":5000")           // no bootstrap nodes
//     s2 := makeServer(":50002", ":5000")  // bootstrap node s1


//     // Start both P2P nodes
//     go func() { log.Println("Starting s1..."); log.Fatal(s1.Start()) }()
//     go func() { log.Println("Starting s2..."); log.Fatal(s2.Start()) }()

//     time.Sleep(2 * time.Second) // wait for bootstrap

//     // HTTP server for uploads
//     http.HandleFunc("/upload", uploadHandler(s2))
//      http.HandleFunc("/files", listFilesHandler)
//     http.HandleFunc("/files/download", downloadFileHandler)

//     fmt.Println("Upload server running on :8082")
//     log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
// }













package main

import (
    "bytes"
    "crypto/sha256"
     "github.com/ujuojadi/PersonalFileS/p2p"
	 "log"
	 "strings"
	 "fmt"
    "net/http"
	"time"
    "io"
    "os"
     "encoding/json" 
   
    "path/filepath"
      
      "mime"
      "strconv"
    "github.com/google/uuid"
   
)

	 
func enableCORS(h http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)
            return
        }

        h.ServeHTTP(w, r)
    })
}

	

func makeServer(listenAddr string, nodes ...string ) *FileServer {
	tcptransportOpts :=p2p.TCPTransportOpts {
		ListenAddr: listenAddr,
		HandshakeFunc :p2p.NOPHandshakeFunc,
		Decoder: p2p.DefaultDecoder{},
		
	}
	tcpTransport :=p2p.NewTCPTransport(tcptransportOpts)
    

	safeRoot := strings.ReplaceAll(listenAddr, ":", "_")
	fileServerOpts :=ServerOpts{
		StorageRoot : safeRoot + "_network",
		PathTransformFunc: CASPathTransformFunc,
		Transport: tcpTransport, 
		BootstrapNodes: nodes,

	}
	s:= NewFileServer(fileServerOpts)
    tcpTransport.OnPeer = s.OnPeer

return s
 
	
}



func uploadHandler(s *FileServer) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        file, header, err := r.FormFile("file")
        if err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        defer file.Close()

        // Compute SHA256 hash for CAS storage
        file.Seek(0, io.SeekStart)
        hasher := sha256.New()
        if _, err := io.Copy(hasher, file); err != nil {
            http.Error(w, "Failed to hash file: "+err.Error(), http.StatusInternalServerError)
            return
        }
        hash := fmt.Sprintf("%x", hasher.Sum(nil))

        // Rewind and store the file using hash as filename
        file.Seek(0, io.SeekStart)
        if err := s.Store(hash, file); err != nil {
            http.Error(w, "Failed to store file: "+err.Error(), http.StatusInternalServerError)
            return
        }

        // Save manifest with original filename
        meta := FileMetadata{
            Hash:       hash,
            Filename:   header.Filename,
            Size:       header.Size,
            Uploader:   "user123",
            Course:     "CS101",
            UploadedAt: time.Now().Format(time.RFC3339),
        }

        if err := os.MkdirAll("manifests", os.ModePerm); err != nil {
            http.Error(w, "Failed to create manifest folder: "+err.Error(), http.StatusInternalServerError)
            return
        }

        manifestPath := fmt.Sprintf("manifests/%s.json", hash) // use hash for manifest filename
        data, err := json.MarshalIndent(meta, "", "  ")
        if err != nil {
            http.Error(w, "Failed to encode manifest: "+err.Error(), http.StatusInternalServerError)
            return
        }

        if err := os.WriteFile(manifestPath, data, 0644); err != nil {
            http.Error(w, "Failed to write manifest: "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.Write([]byte("uploaded"))
    }
}

// File metadata struct
type FileMetadata struct {
    Hash       string `json:"hash"`
    Filename   string `json:"filename"`
    Size       int64  `json:"size"`
    Uploader   string `json:"uploader"`
    Course     string `json:"course"`
    UploadedAt string `json:"uploaded_at"`
}

// List files handler
type FileResponse struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    Size        int64  `json:"size"`
    CourseCode  string `json:"courseCode"`
    CourseName  string `json:"courseName"`
    Description string `json:"description"`
    Type        string `json:"type"`
    UploadedAt  string `json:"uploadedAt"`
}



///all of download




// type File struct {
//     ID          string `json:"ID"`
//     Name        string `json:"Name"`
//     Size        int64  `json:"Size"`
//     Type        string `json:"Type"`
//     CourseCode  string `json:"CourseCode,omitempty"`
//     CourseName  string `json:"CourseName,omitempty"`
//     Description string `json:"description,omitempty"`
//     UploadedAt  int64  `json:"uploadedAt"`
// }



type File struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    Size        int64  `json:"size"`
    Type        string `json:"type"`
    CourseCode  string `json:"courseCode,omitempty"`
    CourseName  string `json:"courseName,omitempty"`
    Description string `json:"description,omitempty"`
    UploadedAt  string `json:"uploadedAt"` // use string from manifest
}

// Directories for P2P networks
var networkDirs = []string{
    "_5000_network",
    "_5002_network",
}

// Map to keep track of file IDs to paths
var fileIndex = map[string]string{}

// helper to detect mime type
func detectMimeType(filename string) string {
    ext := strings.ToLower(filepath.Ext(filename))
    if ext != "" {
        mimeType := mime.TypeByExtension(ext)
        if mimeType != "" {
            return mimeType
        }
    }
    return "application/octet-stream"
}


func indexFiles() ([]File, error) {
    var allFiles []File
    fileIndex = map[string]string{} // reset

    manifestDir := "manifests"
    files, err := os.ReadDir(manifestDir)
    if err != nil {
        return nil, fmt.Errorf("cannot read manifests folder: %v", err)
    }

    for _, f := range files {
        if f.IsDir() {
            continue
        }

        manifestPath := filepath.Join(manifestDir, f.Name())
        data, err := os.ReadFile(manifestPath)
        if err != nil {
            log.Printf("Failed to read manifest %s: %v", f.Name(), err)
            continue
        }

        var meta FileMetadata
        if err := json.Unmarshal(data, &meta); err != nil {
            log.Printf("Failed to parse manifest %s: %v", f.Name(), err)
            continue
        }

        // Use CASPathTransformFunc to locate the stored file
        pathKey := CASPathTransformFunc(meta.Hash)
        var storedPath string
        for _, netDir := range networkDirs {
            candidate := filepath.Join(netDir, pathKey.PathName, pathKey.Filename)
            if _, err := os.Stat(candidate); err == nil {
                storedPath = candidate
                break
            }
        }

        if storedPath == "" {
            log.Printf("File %s not found on disk", meta.Hash)
            continue
        }

        id := uuid.New().String()
        fileIndex[id] = storedPath

        allFiles = append(allFiles, File{
    ID:         id,
    Name:       meta.Filename,      // original filename
    Size:       meta.Size,
    Type:       detectMimeType(meta.Filename),
    UploadedAt: meta.UploadedAt,    // timestamp from manifest
})

    }

    return allFiles, nil
}




// HTTP handler: handle /files endpoint (GET for list, POST for store by key)
func fileHandler(s *FileServer) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method == http.MethodGet {
            // List files
            files, err := indexFiles()
            if err != nil {
                http.Error(w, "Failed to scan files", http.StatusInternalServerError)
                return
            }
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(files)
        } else if r.Method == http.MethodPost {
            // Store file by key (for P2P client)
            key := r.URL.Query().Get("key")
            if key == "" {
                http.Error(w, "key parameter required", http.StatusBadRequest)
                return
            }
            
            // Read file content from request body
            fileContent, err := io.ReadAll(r.Body)
            if err != nil {
                http.Error(w, "Failed to read file content: "+err.Error(), http.StatusBadRequest)
                return
            }
            defer r.Body.Close()
            
            // Store file using the provided key
            if err := s.Store(key, bytes.NewReader(fileContent)); err != nil {
                http.Error(w, "Failed to store file: "+err.Error(), http.StatusInternalServerError)
                return
            }
            
            w.WriteHeader(http.StatusCreated)
            w.Write([]byte("File stored successfully"))
        } else {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    }
}

// HTTP handler: download by ID
// HTTP handler: download by ID


func downloadFileHandler(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    if id == "" {
        http.Error(w, "Missing file ID", http.StatusBadRequest)
        return
    }

    path, ok := fileIndex[id]
    if !ok {
        http.Error(w, "File not found", http.StatusNotFound)
        return
    }

    // Find the manifest to get the original filename
    hash := filepath.Base(path) // your stored file is named by hash
    manifestPath := filepath.Join("manifests", hash+".json")

    var originalName string
    if data, err := os.ReadFile(manifestPath); err == nil {
        var meta FileMetadata
        if err := json.Unmarshal(data, &meta); err == nil {
            originalName = meta.Filename
        }
    }

    if originalName == "" {
        originalName = filepath.Base(path) // fallback
    }

    file, err := os.Open(path)
    if err != nil {
        http.Error(w, "Cannot open file", http.StatusInternalServerError)
        return
    }
    defer file.Close()

    fi, _ := file.Stat()
    mimeType := detectMimeType(originalName) // use original filename for type

    w.Header().Set("Content-Disposition", "attachment; filename="+originalName)
    w.Header().Set("Content-Type", mimeType)
    w.Header().Set("Content-Length", strconv.FormatInt(fi.Size(), 10))

    io.Copy(w, file)
}




func main() {
    // Start single P2P server for development
    s1 := makeServer(":5000")  // no bootstrap nodes

    // Start P2P node in background
    go func() { 
        log.Println("Starting P2P server on :5000...")
        if err := s1.Start(); err != nil {
            log.Fatal(err)
        }
    }()

    time.Sleep(1 * time.Second) // wait for P2P server to start

    // HTTP server for uploads
    http.HandleFunc("/upload", uploadHandler(s1))
    http.HandleFunc("/files", fileHandler(s1))  // Handle both GET (list) and POST (store by key)
    http.HandleFunc("/files/download", downloadFileHandler)

    fmt.Println("HTTP server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", enableCORS(http.DefaultServeMux)))
}



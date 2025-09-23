import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);

    // Add file with 0% progress
    const newFile = {
      id: Date.now(), // unique id for tracking
      name: file.name,
      size: file.size,
      type: file.type,
      preview: previewUrl,
      progress: 0,
    };

    setFiles((prev) => [...prev, newFile]);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, progress } : f
        )
      );
      if (progress >= 100) clearInterval(interval);
    }, 200);

    setFile(null);
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>📤 File Sharing (Frontend Only)</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>

      <h3>📂 Files</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {files.map((f) => (
          <li key={f.id} style={{ marginBottom: 20 }}>
            <p>
              <strong>{f.name}</strong> ({(f.size / 1024).toFixed(1)} KB)
            </p>

            {/* Progress bar */}
            <div
              style={{
                width: "300px",
                height: "10px",
                background: "#eee",
                borderRadius: "5px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: `${f.progress}%`,
                  height: "100%",
                  background: f.progress < 100 ? "#2196f3" : "green",
                  transition: "width 0.2s ease",
                }}
              ></div>
            </div>
            <p>{f.progress}%</p>

            {/* Show previews depending on file type */}
            {f.type.startsWith("image/") && (
              <img
                src={f.preview}
                alt={f.name}
                style={{ width: 150, border: "1px solid #ccc", borderRadius: 8 }}
              />
            )}

            {f.type === "application/pdf" && (
              <iframe
                src={f.preview}
                title={f.name}
                style={{ width: "300px", height: "200px", border: "1px solid #ccc" }}
              />
            )}

            {!f.type.startsWith("image/") && f.type !== "application/pdf" && (
              <a href={f.preview} download={f.name}>
                Download {f.name}
              </a>
            )}

            {/* Delete button */}
            <br />
            <button
              onClick={() => handleDelete(f.id)}
              style={{
                marginTop: 10,
                padding: "5px 10px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              ❌ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

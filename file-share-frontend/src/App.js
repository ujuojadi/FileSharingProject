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

    setFiles([
      ...files,
      { name: file.name, size: file.size, type: file.type, preview: previewUrl },
    ]);

    setFile(null);
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
        {files.map((f, i) => (
          <li key={i} style={{ marginBottom: 20 }}>
            <p>
              <strong>{f.name}</strong> ({(f.size / 1024).toFixed(1)} KB)
            </p>

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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

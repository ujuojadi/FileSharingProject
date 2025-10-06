// src/pages/Dashboard.js
import React, { useState } from "react";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date"); // default sort by date

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = () => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const newFile = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: previewUrl,
      progress: 0,
      uploadedAt: new Date(),
    };

    setFiles((prev) => [...prev, newFile]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFiles((prev) =>
        prev.map((f) => (f.id === newFile.id ? { ...f, progress } : f))
      );
      if (progress >= 100) clearInterval(interval);
    }, 200);

    setFile(null);
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Filter + sort files
  const filteredFiles = files
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return a.size - b.size;
      if (sortBy === "date") return b.uploadedAt - a.uploadedAt; // newest first
      return 0;
    });

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>📤 Dashboard - File Sharing</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>

      {/* 🔎 Search + Sort */}
      <div style={{ marginTop: 20, marginBottom: 20, display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: "300px", padding: "8px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px" }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "8px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px" }}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
        </select>
      </div>

      <h3>📂 Files</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
        {filteredFiles.map((f) => (
          <div
            key={f.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
              background: "#fafafa",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ fontWeight: "bold" }}>{f.name}</p>
            <p style={{ fontSize: "12px", color: "#555" }}>
              {(f.size / 1024).toFixed(1)} KB
            </p>
            <p style={{ fontSize: "11px", color: "gray" }}>
              Uploaded: {f.uploadedAt.toLocaleString()}
            </p>

            {/* Progress bar */}
            <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "5px", overflow: "hidden", marginBottom: "10px" }}>
              <div
                style={{
                  width: `${f.progress}%`,
                  height: "100%",
                  background: f.progress < 100 ? "#2196f3" : "green",
                  transition: "width 0.2s ease",
                }}
              ></div>
            </div>
            <p style={{ fontSize: "12px" }}>{f.progress}%</p>

            {/* Previews */}
            {f.type.startsWith("image/") && (
              <img src={f.preview} alt={f.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px", marginBottom: "10px" }} />
            )}
            {f.type === "application/pdf" && (
              <iframe src={f.preview} title={f.name} style={{ width: "100%", height: "120px", border: "1px solid #ccc", marginBottom: "10px" }} />
            )}
            {!f.type.startsWith("image/") && f.type !== "application/pdf" && (
              <a href={f.preview} download={f.name}>Download {f.name}</a>
            )}

            <button
              onClick={() => handleDelete(f.id)}
              style={{
                marginTop: "10px",
                padding: "5px 10px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ❌ Delete
            </button>
          </div>
        ))}
      </div>

      {/* Message if no files match search */}
      {filteredFiles.length === 0 && files.length > 0 && (
        <p style={{ marginTop: 20, color: "gray" }}>No files match your search.</p>
      )}
    </div>
  );
}

export default Dashboard;

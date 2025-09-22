import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;
    // For now, just add file to list (fake upload)
    setFiles([...files, { name: file.name, size: file.size }]);
    setFile(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📤 File Sharing (Frontend Only)</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>

      <h3>📂 Files</h3>
      <ul>
        {files.map((f, i) => (
          <li key={i}>
            {f.name} ({(f.size / 1024).toFixed(1)} KB)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

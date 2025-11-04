// src/api.js
const API_URL = "http://localhost:8000"; // FastAPI backend

export async function pingServer() {
  const response = await fetch(`${API_URL}/ping-db`);
  if (!response.ok) throw new Error("Server error");
  return response.text();
}

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}

export async function loginUser(data) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}


export async function uploadNote(file, metadata) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("course", metadata.course);
  formData.append("description", metadata.description);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}


export async function downloadNote(file_id, filename) {
  const res = await fetch(`${API_URL}/download/${file_id}`);
  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename; // Use the filename from the DB
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// src/api.js
const API_URL = "http://localhost:8000"; // FastAPI backend

// Token management
export function getToken() {
  return localStorage.getItem("access_token");
}

export function setToken(token) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

// Get auth headers
function getAuthHeaders() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Get auth headers for file uploads
function getAuthHeadersMultipart() {
  const token = getToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }
  return response.json();
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email); // OAuth2 uses 'username' field
  formData.append("password", password);
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }
  const data = await response.json();
  if (data.access_token) {
    setToken(data.access_token);
  }
  return data;
}

export async function logout() {
  removeToken();
}

export async function getFiles() {
  const response = await fetch(`${API_URL}/files/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error("Unauthorized - please login again");
    }
    throw new Error("Failed to fetch files");
  }
  return response.json();
}

export async function uploadNote(file, courseCode, courseName, description) {
  const formData = new FormData();
  formData.append("file", file);
  if (courseCode) formData.append("course_code", courseCode);
  if (courseName) formData.append("course_name", courseName);
  if (description) formData.append("description", description);

  const token = getToken();
  const headers = getAuthHeadersMultipart();

  const res = await fetch(`${API_URL}/files/upload`, {
    method: "POST",
    headers: headers,
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      throw new Error("Unauthorized - please login again");
    }
    const error = await res.json();
    throw new Error(error.detail || "Upload failed");
  }
  return res.json();
}

export async function downloadNote(fileId, filename) {
  const token = getToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/files/${fileId}/download`, {
    method: "GET",
    headers: headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      throw new Error("Unauthorized - please login again");
    }
    throw new Error("Download failed");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function getFileMeta(fileId) {
  const response = await fetch(`${API_URL}/files/${fileId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error("Unauthorized - please login again");
    }
    throw new Error("Failed to fetch file metadata");
  }
  return response.json();
}

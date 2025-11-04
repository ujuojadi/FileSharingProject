const API_BASE_URL = 'http://127.0.0.1:8000';

// Token management
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Authentication APIs
export const authAPI = {
  async register(email, fullName, password) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        full_name: fullName,
        password,
      }),
    });
  },

  async login(email, password) {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  async verifyEmail(email) {
    return apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout() {
    removeToken();
  },
};

// File APIs
export const filesAPI = {
  async listFiles() {
    return apiRequest('/files/');
  },

  async getFile(fileId) {
    return apiRequest(`/files/${fileId}`);
  },

  async uploadFile(file, courseCode, courseName, description) {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (courseCode) formData.append('course_code', courseCode);
    if (courseName) formData.append('course_name', courseName);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async downloadFile(fileId) {
    const token = getToken();
    const url = `${API_BASE_URL}/files/${fileId}/download`;
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
  },
};

// Group APIs
export const groupsAPI = {
  async listGroups() {
    return apiRequest('/groups/');
  },

  async createGroup(name, description) {
    return apiRequest('/groups/', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
      }),
    });
  },

  async joinGroup(groupId) {
    return apiRequest(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  },

  async getGroupRecommendations(groupId) {
    return apiRequest(`/groups/${groupId}/recommendations`);
  },
};

// User APIs
export const usersAPI = {
  async getCurrentUser() {
    return apiRequest('/users/me');
  },

  async listUsers() {
    return apiRequest('/users/');
  },

  async getUser(userId) {
    return apiRequest(`/users/${userId}`);
  },
};

// Search API
export const searchAPI = {
  async searchFiles(query, courseCode, courseName) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (courseCode) params.append('course_code', courseCode);
    if (courseName) params.append('course_name', courseName);
    return apiRequest(`/search/files?${params.toString()}`);
  },
};

export default {
  auth: authAPI,
  files: filesAPI,
  groups: groupsAPI,
  users: usersAPI,
  search: searchAPI,
};

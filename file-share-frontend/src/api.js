import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, ''),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const auth = {
    login: (credentials) => api.post('/auth/login', new URLSearchParams(credentials).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
    register: (userData) => api.post('/auth/register', userData),
    verifyEmail: (email) => api.post('/auth/verify', { email }),
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },
};

// User endpoints
export const users = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (data) => api.put('/users/me', data),
    list: () => api.get('/users'),
    getOne: (id) => api.get(`/users/${id}`),
};

// File endpoints
export const files = {
    upload: (file, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        if (metadata.courseCode) formData.append('course_code', metadata.courseCode);
        if (metadata.courseName) formData.append('course_name', metadata.courseName);
        if (metadata.description) formData.append('description', metadata.description);
        
        return api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    list: () => api.get('/files'),
    getOne: (fileId) => api.get(`/files/${fileId}`),
    download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
    delete: (fileId) => api.delete(`/files/${fileId}`),
    search: (params) => api.get('/search/files', { params }),
};

// Groups endpoints
export const groups = {
    create: (data) => api.post('/groups', data),
    list: () => api.get('/groups'),
    getOne: (id) => api.get(`/groups/${id}`),
    join: (groupId) => api.post(`/groups/${groupId}/join`),
    getRecommendations: (groupId) => api.get(`/groups/${groupId}/recommendations`),
};

// Feedback endpoints
export const feedback = {
    submit: (data) => api.post('/feedback', data),
    edit: (feedbackId, data) => api.patch(`/feedback/${feedbackId}`, data),
    getForFile: (fileId) => api.get(`/feedback/${fileId}`),
};

export default api;

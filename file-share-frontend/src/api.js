// import axios from 'axios';

// // Create axios instance with default config
// // const api = axios.create({
// //     baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, ''),
// //     headers: {
// //         'Content-Type': 'application/json',
// //     },
// // });
// console.log("API baseURL:", process.env.REACT_APP_API_BASE_URL);

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });


// // Request interceptor to add auth token
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// // Response interceptor to handle errors
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401 && window.location.pathname !== '/login') {
//             // Handle unauthorized access
//             localStorage.removeItem('token');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// // Token management helpers (for compatibility)
// export function getToken() {
//     return localStorage.getItem('token');
// }

// export function setToken(token) {
//     localStorage.setItem('token', token);
// }

// export function removeToken() {
//     localStorage.removeItem('token');
// }

// // Auth endpoints


// export const auth = {
//     login: (credentials) => {
//   const params = new URLSearchParams();
//   params.append("username", credentials.username);
//   params.append("password", credentials.password);

//   return api.post("/login", params, {
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//   });
// },

// };

// // User endpoints
// export const users = {
//     getProfile: () => api.get('/me'),
//     updateProfile: (data) => api.put('/me', data),
//     list: () => api.get('/users'),
//     getOne: (id) => api.get(`/users/${id}`),
// };

// // File endpoints
// // export const files = {
// //     upload: (file, metadata = {}) => {
// //         const formData = new FormData();
// //         formData.append('file', file);
// //         if (metadata.courseCode) formData.append('course_code', metadata.courseCode);
// //         if (metadata.courseName) formData.append('course_name', metadata.courseName);
// //         if (metadata.description) formData.append('description', metadata.description);
        
// //         return api.post('/files/upload', formData, {
// //             headers: {
// //                 'Content-Type': 'multipart/form-data',
// //             },
// //         });
// //     },
// //     list: () => api.get('/files'),
// //     getOne: (fileId) => api.get(`/files/${fileId}`),
// //     download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
// //     delete: (fileId) => api.delete(`/files/${fileId}`),
// //     search: (params) => api.get('/search/files', { params }),
// // };

// export const files = {
//     upload: (file, metadata = {}) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         if (metadata.courseCode) formData.append('courseCode', metadata.courseCode);
//         if (metadata.courseName) formData.append('courseName', metadata.courseName);
//         if (metadata.description) formData.append('description', metadata.description);
        
//         // Update endpoint to match backend
//         return api.post('/upload', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//     },
//     list: () => api.get('/files'),
//     getOne: (fileId) => api.get(`/files/${fileId}`),
//     download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
//     delete: (fileId) => api.delete(`/files/${fileId}`),
//     search: (params) => api.get('/search/files', { params }),
// };


// // Groups endpoints
// export const groups = {
//     create: (data) => api.post('/groups', data),
//     list: () => api.get('/groups'),
//     getOne: (id) => api.get(`/groups/${id}`),
//     join: (groupId) => api.post(`/groups/${groupId}/join`),
//     getRecommendations: (groupId) => api.get(`/groups/${groupId}/recommendations`),
// };

// // Feedback endpoints
// export const feedback = {
//     submit: (data) => api.post('/feedback', data),
//     edit: (feedbackId, data) => api.patch(`/feedback/${feedbackId}`, data),
//     getForFile: (fileId) => api.get(`/feedback/${fileId}`),
// };

// // Compatibility exports for existing code
// export async function loginUser(email, password) {
//     const response = await auth.login({ username: email, password });
//     // The auth.login already stores the token via interceptor, but we ensure it's set
//     if (response.data.access_token) {
//         setToken(response.data.access_token);
//     }
//     return response.data;
// }




// export async function registerUser(data) {
//     const response = await auth.register(data);
//     return response.data;
// }

// export async function logout() {
//     auth.logout();
// }

// export async function getFiles() {
//     const response = await files.list();
//     return response.data;
// }

// export async function uploadNote(file, courseCode, courseName, description) {
//     const response = await files.upload(file, { courseCode, courseName, description });
//     return response.data;
// }

// // export async function downloadNote(fileId, filename) {
// //     const response = await files.download(fileId);
// //     const blob = new Blob([response.data]);
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = filename;
// //     document.body.appendChild(a);
// //     a.click();
// //     a.remove();
// //     window.URL.revokeObjectURL(url);
// // }

// export async function downloadNote(fileId, filename) {
//     const response = await files.download(fileId);
//     const url = window.URL.createObjectURL(response.data); // use response.data directly
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
// }

// export async function getFileMeta(fileId) {
//     const response = await files.getOne(fileId);
//     return response.data;
// }

// export default api;



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

// Token management helpers (for compatibility)
export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function removeToken() {
    localStorage.removeItem('token');
}

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
// export const files = {
//     upload: (file, metadata = {}) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         if (metadata.courseCode) formData.append('course_code', metadata.courseCode);
//         if (metadata.courseName) formData.append('course_name', metadata.courseName);
//         if (metadata.description) formData.append('description', metadata.description);
        
//         return api.post('/files/upload', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//     },
//     list: () => api.get('/files'),
//     getOne: (fileId) => api.get(`/files/${fileId}`),
//     download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
//     delete: (fileId) => api.delete(`/files/${fileId}`),
//     search: (params) => api.get('/search/files', { params }),
// };

export const files = {
    upload: (file, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        if (metadata.courseCode) formData.append('courseCode', metadata.courseCode);
        if (metadata.courseName) formData.append('courseName', metadata.courseName);
        if (metadata.description) formData.append('description', metadata.description);
        
        // Update endpoint to match backend
        // return api.post('/upload', formData, {
        //     headers: {
        //         'Content-Type': 'multipart/form-data',
        //     },
        // });

        return axios.post('http://localhost:8080/upload', formData, {
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

// Compatibility exports for existing code
// export async function loginUser(email, password) {
//     const response = await auth.login({ username: email, password });
//     // The auth.login already stores the token via interceptor, but we ensure it's set
//     if (response.data.access_token) {
//         setToken(response.data.access_token);
//     }
//     return response.data;
// }

export async function loginUser(email, password) {
  try {
    // Create URLSearchParams for form-encoded body
    const params = new URLSearchParams();
    params.append("grant_type", "password"); // required by FastAPI OAuth2
    params.append("username", email);
    params.append("password", password);
    params.append("scope", ""); // optional
    params.append("client_id", ""); // optional
    params.append("client_secret", ""); // optional

    const response = await api.post("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Save access token
    if (response.data.access_token) {
      setToken(response.data.access_token);
    }

    return response.data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err);
    throw err;
  }
}





export async function registerUser(data) {
    const response = await auth.register(data);
    return response.data;
}

export async function logout() {
    auth.logout();
}

export async function getFiles() {
    const response = await files.list();
    return response.data;
}

export async function uploadNote(file, courseCode, courseName, description) {
    const response = await files.upload(file, { courseCode, courseName, description });
    return response.data;
}

// export async function downloadNote(fileId, filename) {
//     const response = await files.download(fileId);
//     const blob = new Blob([response.data]);
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
// }

export async function downloadNote(fileId, filename) {
    const response = await files.download(fileId);
    const url = window.URL.createObjectURL(response.data); // use response.data directly
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export async function getFileMeta(fileId) {
    const response = await files.getOne(fileId);
    return response.data;
}

export default api;

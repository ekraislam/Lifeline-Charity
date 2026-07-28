import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust in prod or .env
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor for responses (e.g. handle 401 token expiry)
api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        // Clear token and redirect to login if not already there
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;

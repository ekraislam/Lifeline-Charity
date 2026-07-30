import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://backend-lifeline.smsakib.shop').replace(/\/+$/, '');
const baseURL = `${API_BASE_URL}/api`;

export const getMediaUrl = (path) => {
    if (!path) return '';
    if (typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

console.log("VITE_API_URL is currently:", API_BASE_URL);
console.log("Axios baseURL is configured to:", baseURL);

const api = axios.create({
    baseURL: baseURL,
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

// Trigger Vite HMR

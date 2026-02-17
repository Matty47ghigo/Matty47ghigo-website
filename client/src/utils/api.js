import axios from 'axios';

// Create axios instance with cookie support
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,  // Send cookies with requests
});

// Response interceptor to handle 401 errors (expired/invalid tokens)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear user data and redirect to login
            localStorage.removeItem('user');

            // Only redirect if not already on login/register pages
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

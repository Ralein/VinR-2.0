/**
 * API Client — Axios instance with auth interceptors
 */

import axios from 'axios';
import { getItemAsync, deleteItemAsync } from '../utils/storage';
import { config } from '../constants/config';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: config.API_BASE_URL.endsWith('/') ? config.API_BASE_URL : `${config.API_BASE_URL}/`,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to strip leading slashes from URLs to ensure they are relative to baseURL path
api.interceptors.request.use(
    (config) => {
        if (config.url?.startsWith('/')) {
            config.url = config.url.substring(1);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Request interceptor — attach auth token
api.interceptors.request.use(
    async (config) => {
        const token = await getItemAsync('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await deleteItemAsync('authToken');
            useAuthStore.getState().signOut();
        }
        return Promise.reject(error);
    }
);

export default api;

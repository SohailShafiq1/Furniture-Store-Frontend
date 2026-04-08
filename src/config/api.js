// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '') || 'http://localhost:5001';

// Helper to ensure URLs are always valid
export const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const getBackendUrl = () => (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

export { API_BASE_URL, BACKEND_URL };

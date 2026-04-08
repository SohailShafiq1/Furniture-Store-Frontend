// API Configuration
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Ensure the URL is valid and properly formatted
if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
  apiUrl = 'https://' + apiUrl;
}

const API_BASE_URL = apiUrl;
const BACKEND_URL = (apiUrl || 'http://localhost:5001/api').replace(/\/api\/?$/, '') || 'http://localhost:5001';

// Helper to ensure URLs are always valid
export const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
};

export const getBackendUrl = () => {
  const url = getApiUrl();
  return url.replace(/\/api\/?$/, '') || 'http://localhost:5001';
};

export { API_BASE_URL, BACKEND_URL };

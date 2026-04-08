import axios from 'axios';
import { getApiUrl } from '../config/api';

/**
 * Create axios instance with error logging for debugging
 */
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to log errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded but with error status
      const data = error.response.data;
      const isHtml = typeof data === 'string' && data.includes('<!');
      
      console.error('API Error:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        statusText: error.response.statusText,
        isHTML: isHtml,
        dataType: typeof data,
        preview: isHtml ? data.substring(0, 100) : data,
      });
      
      if (isHtml) {
        console.error('⚠️ Backend returned HTML instead of JSON. Check:');
        console.error('  1. Is the API server running?');
        console.error('  2. Is the endpoint correct?');
        console.error('  3. Is CORS configured?');
      }
    } else if (error.request) {
      console.error('API Request Error (no response):', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

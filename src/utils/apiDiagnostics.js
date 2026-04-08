import axios from 'axios';
import { API_BASE_URL, BACKEND_URL, getApiUrl } from '../config/api';

/**
 * Diagnostic utility to check API endpoint health
 */
export const diagnosisAPI = async () => {
  console.log('=== API DIAGNOSTIC REPORT ===');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('BACKEND_URL:', BACKEND_URL);
  console.log('getApiUrl():', getApiUrl());

  const endpoints = [
    '/categories/all',
    '/products/all',
    '/home-content/get-all-content',
    '/admin/stores',
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Testing: ${endpoint}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ ${endpoint} - Status: ${response.status}, Data type: ${typeof response.data}`);
    } catch (error) {
      console.error(`❌ ${endpoint} - Error:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: typeof error.response?.data === 'string' 
          ? error.response.data.substring(0, 100) 
          : error.response?.data,
      });
    }
  }
};

/**
 * Quick test to verify a specific product can be fetched
 */
export const testProductAttribution = async (productId) => {
  try {
    console.log(`Testing product attribution for: ${productId}`);
    const url = `${API_BASE_URL}/products/attribution/${productId}`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, { timeout: 5000 });
    console.log('✅ Attribution fetch successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Attribution fetch failed:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseType: typeof error.response?.data,
      responsePreview: typeof error.response?.data === 'string'
        ? error.response.data.substring(0, 200)
        : JSON.stringify(error.response?.data).substring(0, 200),
    });
    return null;
  }
};

// Auto-run diagnostics if URL contains debug flag
if (window.location.search.includes('debug=api')) {
  console.log('Debug mode enabled, running diagnostics...');
  setTimeout(() => diagnosisAPI(), 100);
}

export default { diagnosisAPI, testProductAttribution };

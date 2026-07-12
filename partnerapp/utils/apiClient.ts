// @/utils/apiClient.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

console.log('[apiClient] EXPO_PUBLIC_API_BASE_URL =', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    // We assume the token is saved under 'partner_token' during login
    const token = await SecureStore.getItemAsync('partner_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[apiClient] ->', (config.method || '').toUpperCase(), (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    console.log('[apiClient] request setup error:', error.message);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('[apiClient] <-', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log('[apiClient] <- error', error.response.status, error.config?.url, error.response.data);
    } else {
      console.log('[apiClient] <- no response (network/timeout):', error.message, 'for', error.config?.baseURL, error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
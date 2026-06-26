import axios from 'axios';
import { Platform } from 'react-native';

// Universal Token Storage (LocalStorage for Web, In-Memory for Native placeholder)
let tokenMemory: string | null = null;
let userMemory: any = null;

export const setToken = async (token: string | null) => {
  tokenMemory = token;
  if (Platform.OS === 'web') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
};

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('auth_token');
  }
  return tokenMemory;
};

export const setUser = async (user: any) => {
  userMemory = user;
  if (Platform.OS === 'web') {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }
};

export const getUser = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
  return userMemory;
};

// Axios Instance
const api = axios.create({
  baseURL: 'https://doctor-and-patient-app-backend-service-g6bsawc7b5cwfdct.centralindia-01.azurewebsites.net/api', // Deployed Azure Functions URL
});

// Inject JWT Token interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import { decrypt } from '../components/AuthManager/AuthManager';

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export const setAuthToken = (token: string) => {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};

instance.interceptors.request.use(
  (config) => {
    const jwtCookie = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('jwt='));
    if (jwtCookie) {
      const encryptedJwt = jwtCookie.split('=')[1];
      const decryptedJwt = decrypt(encryptedJwt);
      config.headers['Authorization'] = `Bearer ${decryptedJwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

export const setAuthToken = (token: string) => {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};

export default instance;

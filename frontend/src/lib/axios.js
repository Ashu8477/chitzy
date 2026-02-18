import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: 'https://chitzy-backend.onrender.com/api',
  withCredentials: true,
});

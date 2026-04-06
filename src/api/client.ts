// src/api/client.ts
import { config } from '@/config';
import axios from 'axios';

const client = axios.create({
  baseURL: config.apiUrl,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

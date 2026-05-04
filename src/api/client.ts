// src/api/client.ts
import { config } from '@/config';
import axios from 'axios';
import qs from 'qs';

const client = axios.create({
  baseURL: config.apiUrl,
  paramsSerializer: (params) => {
    // Используем qs с настройкой для повторяющихся параметров
    return qs.stringify(params, {
      arrayFormat: 'repeat', // Это даст brandId=1&brandId=2 вместо brandId[]=1
      skipNulls: true,
      filter: (_, value) =>
        value !== '' && value !== undefined && value !== null
          ? value
          : undefined,
    });
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

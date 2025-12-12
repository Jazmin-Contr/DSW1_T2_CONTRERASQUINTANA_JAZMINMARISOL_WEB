import axios from 'axios';

const api = axios.create({
  // CAMBIA EL PUERTO SI ES DIFERENTE
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
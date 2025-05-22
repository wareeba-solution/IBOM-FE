// ut
import axios from 'axios';

// read from env, fallback to localhost if missing
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const apiBase = axios.create({
  baseURL: API_BASE_URL,
  // you can add default headers here:
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiBase;
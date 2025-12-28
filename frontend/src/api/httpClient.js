// frontend/src/api/httpClient.js
import axios from "axios";

/**
 * VITE_API_BASE_URL=http://127.0.0.1:8000
 */
const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

const BASE = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Token ${token}`;
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common.Authorization;
}

export default api;

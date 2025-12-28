import axios from "axios";

// NOTE: Keep this aligned with Django.
// In your backend settings/urls, API is exposed under /api/...
const BASE = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Sets or clears the Authorization header for future requests.
 * Backend uses DRF TokenAuthentication => `Authorization: Token <key>`
 */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

try {
  const bootToken = localStorage.getItem("authToken");
  if (bootToken) setAuthToken(bootToken);
} catch {
  // ignore (e.g. SSR)
}

api.interceptors.request.use(
  (config) => {
    try {
      const t = localStorage.getItem("authToken");
      if (t) config.headers.Authorization = `Token ${t}`;
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// frontend/src/api/authApi.js
import api from "./httpClient";

/**
 * Backend: POST /api/auth/login/
 * body: { email OR username, password }
 * response: { token: "...", user: {...} }
 */
export async function loginRequest({ email, username, password }) {
  const res = await api.post("/auth/login/", { email, username, password });
  return res.data;
}

/** Backend: GET /api/auth/me/ */
export async function meRequest() {
  const res = await api.get("/auth/me/");
  return res.data;
}

/** Backend: POST /api/auth/logout/ */
export async function logoutRequest() {
  const res = await api.post("/auth/logout/");
  return res.data;
}

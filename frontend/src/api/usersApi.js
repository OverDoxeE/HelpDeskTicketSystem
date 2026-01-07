import httpClient from "./httpClient";

export async function fetchTechnicians() {
  const res = await httpClient.get("/users/technicians/");
  return res.data; // [{id, username, email}]
}

// =========================
// Admin user management
// =========================

export async function fetchUsers() {
  const res = await httpClient.get("/users/");
  return res.data; // [{id, username, email, role, is_active}]
}

export async function createUser({ username, email, password, role, is_active = true }) {
  const res = await httpClient.post("/users/", {
    username,
    email,
    password,
    role,
    is_active,
  });
  return res.data;
}

export async function updateUser(userId, payload) {
  // payload: {role?, is_active?, email?, username?, password?}
  const res = await httpClient.patch(`/users/${userId}/`, payload);
  return res.data;
}

export async function deleteUser(userId) {
  const res = await httpClient.delete(`/users/${userId}/`);
  return res.data;
}

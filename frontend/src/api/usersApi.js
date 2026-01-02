import httpClient from "./httpClient";

export async function fetchTechnicians() {
  const res = await httpClient.get("/users/technicians/");
  return res.data; // [{id, username, email}]
}

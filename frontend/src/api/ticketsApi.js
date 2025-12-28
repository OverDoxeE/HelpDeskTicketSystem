import api from "./httpClient";

/**
 * API:
 * - GET    /tickets/
 * - POST   /tickets/
 * - GET    /tickets/{id}/
 * - PATCH  /tickets/{id}/
 * - DELETE /tickets/{id}/
 * - PATCH  /tickets/{id}/status/
 */

export async function fetchTickets() {
  const res = await api.get("/tickets/");
  return res.data;
}

export async function fetchTicketById(id) {
  const res = await api.get(`/tickets/${id}/`);
  return res.data;
}

export async function createTicket(ticketData) {
  const res = await api.post("/tickets/", ticketData);
  return res.data;
}

export async function updateTicketStatus(id, newStatus) {
  const res = await api.patch(`/tickets/${id}/status/`, { status: newStatus });
  return res.data;
}

export async function deleteTicket(id) {
  await api.delete(`/tickets/${id}/`);
  return true;
}
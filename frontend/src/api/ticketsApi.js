// frontend/src/api/ticketsApi.js
import api from "./httpClient";

// GET /api/tickets/
export async function fetchTickets() {
  const res = await api.get("/tickets/");
  return res.data;
}

// GET /api/tickets/{id}/
export async function fetchTicketById(id) {
  const res = await api.get(`/tickets/${id}/`);
  return res.data;
}

// POST /api/tickets/
export async function createTicket(ticketData) {
  // ticketData: { title, description, ... }
  const res = await api.post("/tickets/", ticketData);
  return res.data;
}

// PATCH /api/tickets/{id}/status/
export async function updateTicketStatus(id, newStatus) {
  // newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  const res = await api.patch(`/tickets/${id}/status/`, { status: newStatus });
  return res.data;
}

// DELETE /api/tickets/{id}/
export async function deleteTicket(id) {
  const res = await api.delete(`/tickets/${id}/`);
  return res.data;
}

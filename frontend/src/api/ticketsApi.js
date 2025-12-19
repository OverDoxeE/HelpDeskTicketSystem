// frontend/src/api/ticketsApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export async function fetchTickets() {
  try {
    const response = await api.get("/tickets/");
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
}

export async function fetchTicketById(id) {
  try {
    const response = await api.get(`/tickets/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ticket ${id}:`, error);
    throw error;
  }
}

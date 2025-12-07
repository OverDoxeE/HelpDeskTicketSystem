import axios from 'axios';

export async function fetchTickets() {
  const response = await axios.get('/api/tickets/');
  return response.data;
}

export async function fetchTicketById(id) {
  const response = await axios.get(`/api/tickets/${id}/`);
  return response.data;
}

import axios from 'axios';

export async function getTickets() {
  const response = await axios.get('/api/tickets/');
  return response.data;
}

export async function getTicketById(id) {
  const response = await axios.get(`/api/tickets/${id}/`);
  return response.data;
}

// frontend/src/api/ticketsApi.js

let tickets = [
  { id: 1, title: "Printer not working", status: "open", description: "Office printer is jammed." },
  { id: 2, title: "Cannot login to VPN", status: "in_progress", description: "VPN client throws an error." },
  { id: 3, title: "Broken keyboard", status: "closed", description: "Several keys are not working." },
];

const listeners = new Set();

export function subscribeTickets(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyTicketsChanged() {
  for (const cb of listeners) cb();
}

export async function fetchTickets() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return tickets;
}

export async function fetchTicketById(id) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return tickets.find((t) => t.id === Number(id)) || null;
}

export async function createTicket(ticketData) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newId = tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

  const newTicket = {
    id: newId,
    title: ticketData.title,
    description: ticketData.description || "",
    status: "open",
  };

  tickets = [...tickets, newTicket];

  console.log("Creating ticket (fake API):", newTicket);

  notifyTicketsChanged();

  return newTicket;
}

export async function updateTicketStatus(id, newStatus) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const idx = tickets.findIndex((t) => t.id === Number(id));
  if (idx === -1) return null;

  tickets[idx] = { ...tickets[idx], status: newStatus };

  notifyTicketsChanged();

  return tickets[idx];
}

export async function deleteTicket(id) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const before = tickets.length;
  tickets = tickets.filter((t) => t.id !== Number(id));

  if (tickets.length === before) return false;

  notifyTicketsChanged();

  return true;
}

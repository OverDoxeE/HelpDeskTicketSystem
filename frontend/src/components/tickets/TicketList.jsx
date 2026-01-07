import React from 'react';
import { Link } from 'react-router-dom';

function TicketList({ tickets }) {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return <p>No tickets yet.</p>;
  }

  return (
    <ul>
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link to={`/tickets/${ticket.id}`}>
            {ticket.title} – status: {ticket.status}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default TicketList;

import React from 'react';

function TicketList({ tickets, onSelectTicket, onAddTicket }) {
  return (
    <div>
      <h3>Tickets</h3>
      <button onClick={onAddTicket}>Add Ticket</button>
      <ul>
        {tickets && tickets.map(ticket => (
          <li key={ticket.id} onClick={() => onSelectTicket(ticket)}>
            {ticket.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TicketList;

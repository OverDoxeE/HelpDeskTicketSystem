import React from 'react';

function TicketList({ tickets }) {
  if (!tickets || tickets.length === 0) {
    return <div>No tickets to display.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map(ticket => (
          <tr key={ticket.id}>
            <td>{ticket.id}</td>
            <td>{ticket.title}</td>
            <td>{ticket.status}</td>
            <td>{ticket.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TicketList;

import React from 'react';

function TicketDetails({ ticket, onStatusChange, onCommentAdd }) {
  if (!ticket) return <div>No ticket selected.</div>;
  return (
    <div>
      <h3>{ticket.title}</h3>
      <p>{ticket.description}</p>
      {/* ...status and comments UI later... */}
      <button onClick={() => onStatusChange && onStatusChange(ticket)}>Change Status</button>
      <button onClick={() => onCommentAdd && onCommentAdd(ticket)}>Add Comment</button>
    </div>
  );
}

export default TicketDetails;

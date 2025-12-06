import React from 'react';
import TicketDetails from '../components/tickets/TicketDetails';

function TicketDetailsPage() {
  // ...fetch ticket by ID logic later...
  const ticket = null;
  return (
    <div>
      <TicketDetails
        ticket={ticket}
        onStatusChange={() => {}}
        onCommentAdd={() => {}}
      />
    </div>
  );
}

export default TicketDetailsPage;

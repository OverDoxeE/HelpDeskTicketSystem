import React, { useEffect, useState } from 'react';
import { getTickets } from '../api/ticketsApi';
import TicketList from '../components/tickets/TicketList';

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTickets()
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load tickets.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Tickets</h2>
      <TicketList tickets={tickets} />
    </div>
  );
}

export default TicketListPage;

import React, { useEffect, useState } from 'react';
import { fetchTickets } from '../api/ticketsApi';
import TicketList from '../components/tickets/TicketList';

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchTickets()
      .then(data => {
        setTickets(data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load tickets');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Tickets</h1>
      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : tickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        <TicketList tickets={tickets} />
      )}
    </div>
  );
}

export default TicketListPage;

// frontend/src/pages/TicketListPage.jsx
import React, { useEffect, useState } from "react";
import TicketList from "../components/tickets/TicketList";
import { fetchTickets } from "../api/ticketsApi";

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const data = await fetchTickets();
        setTickets(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  if (loading) return <p>Loading tickets…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Tickets</h1>
      <TicketList tickets={tickets} />
    </div>
  );
}

export default TicketListPage;

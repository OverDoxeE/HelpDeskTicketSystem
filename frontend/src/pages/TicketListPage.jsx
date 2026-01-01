import React, { useEffect, useState } from "react";
import TicketsTable from "../components/tickets/TicketsTable";
import { fetchTickets } from "../api/ticketsApi";
import { fetchCategories } from "../api/categoriesApi";

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, categoriesData] = await Promise.all([
        fetchTickets(),
        fetchCategories(),
      ]);
      setTickets(ticketsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets or categories:", err);
      setError("Failed to load tickets or categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p>Loading tickets…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Tickets</h1>
      <TicketsTable tickets={tickets} categories={categories} />
    </div>
  );
}

export default TicketListPage;

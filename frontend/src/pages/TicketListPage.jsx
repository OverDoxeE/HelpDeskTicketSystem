import React, { useEffect, useState } from "react";
import TicketsTable from "../components/tickets/TicketsTable";
import { fetchTickets } from "../api/ticketsApi";
import { fetchCategories } from "../api/categoriesApi";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "./TicketListPage.css";

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

  return (
    <div className="tickets-list-root">
      <Container maxWidth="ld">
        <Paper elevation={3} className="tickets-list-paper">
          <Box mb={1} textAlign="center">
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Tickets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse all submitted help desk tickets below.
            </Typography>
          </Box>
          {loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading tickets...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TicketsTable tickets={tickets} categories={categories} />
          )}
        </Paper>
      </Container>
    </div>
  );
}

export default TicketListPage;

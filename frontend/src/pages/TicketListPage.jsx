import React, { useEffect, useState, useMemo } from "react";
import TicketsTable from "../components/tickets/TicketsTable";
import { fetchTickets } from "../api/ticketsApi";
import { fetchCategories } from "../api/categoriesApi";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useAuth } from "../context/AuthContext";
import "./TicketListPage.css";

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlyAssignedToMe, setOnlyAssignedToMe] = useState(false);

  const { user } = useAuth() || {};

  // Defensive helper for role check
  const isSupportOrAdmin = useMemo(() => {
    if (!user) return false;
    // Accepts: user.role or user.groups (array of roles)
    const roles = [
      typeof user.role === "string" ? user.role : null,
      ...(Array.isArray(user.groups) ? user.groups : []),
    ]
      .filter(Boolean)
      .map((r) => r.toLowerCase());
    return roles.includes("technician") || roles.includes("admin");
  }, [user]);

  const visibleTickets = useMemo(() => {
    if (!onlyAssignedToMe) return tickets;
    return tickets.filter(
      (t) => (t.assigned_to ?? null) === (user?.id ?? null)
    );
  }, [tickets, onlyAssignedToMe, user?.id]);

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
            {isSupportOrAdmin && (
              <Box mt={2} display="flex" justifyContent="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyAssignedToMe}
                      onChange={(_, checked) => setOnlyAssignedToMe(checked)}
                      color="primary"
                    />
                  }
                  label="Assigned to me only"
                />
              </Box>
            )}
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
          ) : onlyAssignedToMe && visibleTickets.length === 0 ? (
            <Alert severity="info">Brak przypisanych ticketów.</Alert>
          ) : (
            <TicketsTable tickets={visibleTickets} categories={categories} />
          )}
        </Paper>
      </Container>
    </div>
  );
}

export default TicketListPage;

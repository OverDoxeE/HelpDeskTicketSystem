// src/pages/TicketDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";

import {
  fetchTicketById,
  updateTicketStatus,
  deleteTicket,
} from "../api/ticketsApi";
import api from "../api/httpClient";
import { fetchTechnicians } from "../api/usersApi";

import { TICKET_STATUS, TICKET_STATUS_LABELS } from "../constants/ticketStatus";
import { formatUserBrief } from "../utils/formatUser";

import CommentsSection from "../components/comments/CommentsSection";
import "./TicketDetailsPage.css";

// --- Helpers: badge -> MUI Chip color/variant mapping ---
function statusChipProps(status) {
  switch (status) {
    case TICKET_STATUS.OPEN:
      return {
        label: TICKET_STATUS_LABELS[status] || "OPEN",
        className: "chip chip--open",
      };
    case TICKET_STATUS.IN_PROGRESS:
      return {
        label: TICKET_STATUS_LABELS[status] || "IN PROGRESS",
        className: "chip chip--inprogress",
      };
    case TICKET_STATUS.RESOLVED:
      return {
        label: TICKET_STATUS_LABELS[status] || "RESOLVED",
        className: "chip chip--resolved",
      };
    case TICKET_STATUS.CLOSED:
      return {
        label: TICKET_STATUS_LABELS[status] || "CLOSED",
        className: "chip chip--closed",
      };
    default:
      return { label: status || "-", className: "chip" };
  }
}

function priorityChipProps(priority) {
  switch (priority) {
    case "LOW":
      return { label: "LOW", className: "chip chip--p-low" };
    case "MEDIUM":
      return { label: "MEDIUM", className: "chip chip--p-medium" };
    case "HIGH":
      return { label: "HIGH", className: "chip chip--p-high" };
    case "CRITICAL":
      return { label: "CRITICAL", className: "chip chip--p-critical" };
    default:
      return { label: priority || "-", className: "chip" };
  }
}

function parseBackendError(e) {
  const data = e?.response?.data;
  if (!data) return e?.message || "Save failed";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    return (
      data.detail ||
      data.error ||
      Object.entries(data)
        .map(([k, v]) =>
          Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${String(v)}`
        )
        .join("\n")
    );
  }
  return "Save failed";
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(null);

  // Draft state (Save/Cancel)
  const [draftStatus, setDraftStatus] = useState("");
  const [draftAssignedTo, setDraftAssignedTo] = useState(null);

  // Load ticket + technicians
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setBackendError(null);

        // 1) Ticket – krytyczne
        const ticketData = await fetchTicketById(id);
        if (!mounted) return;

        if (!ticketData) {
          setTicket(null);
          setError("Ticket not found");
          return;
        }

        setTicket(ticketData);
        setDraftStatus(ticketData.status || TICKET_STATUS.OPEN);
        setDraftAssignedTo(ticketData.assigned_to ?? null);

        // 2) Technicians – opcjonalne (nie blokuje widoku)
        try {
          const techs = await fetchTechnicians();
          if (!mounted) return;
          setTechnicians(Array.isArray(techs) ? techs : []);
        } catch (e) {
          console.warn("Technicians endpoint unavailable:", e?.message);
          if (!mounted) return;
          setTechnicians([]);
        }
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load ticket");
        setTicket(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const isDirty = useMemo(() => {
    if (!ticket) return false;
    const currentAssigned = ticket.assigned_to ?? null;
    const draftAssigned = draftAssignedTo ?? null;
    return draftStatus !== ticket.status || draftAssigned !== currentAssigned;
  }, [ticket, draftStatus, draftAssignedTo]);

  const handleCancel = () => {
    if (!ticket) return;
    setDraftStatus(ticket.status || TICKET_STATUS.OPEN);
    setDraftAssignedTo(ticket.assigned_to ?? null);
    setBackendError(null);
  };

  const handleSave = async () => {
    if (!ticket) return;

    setSaving(true);
    setBackendError(null);

    try {
      let updatedTicket = ticket;

      // 1) Status
      if (draftStatus !== ticket.status) {
        updatedTicket = await updateTicketStatus(id, draftStatus);
      }

      // 2) Assigned to
      const currentAssigned = ticket.assigned_to ?? null;
      const draftAssigned = draftAssignedTo ?? null;

      if (draftAssigned !== currentAssigned) {
        const res = await api.patch(`/tickets/${id}/assign/`, {
          assigned_to: draftAssigned,
        });
        updatedTicket = res.data;
      }

      setTicket(updatedTicket);
      setDraftStatus(updatedTicket.status || TICKET_STATUS.OPEN);
      setDraftAssignedTo(updatedTicket.assigned_to ?? null);
    } catch (e) {
      console.error(e);
      setBackendError(parseBackendError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this ticket?")) return;

    try {
      setSaving(true);
      setError(null);
      await deleteTicket(id);
      navigate("/tickets");
    } catch (e) {
      console.error(e);
      setError("Failed to delete ticket");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-details-root">
        <Container maxWidth="md">
          <Paper elevation={3} className="ticket-details-card">
            <Box className="ticket-details-loading">
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading ticket...</Typography>
            </Box>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div className="ticket-details-root">
      <Container maxWidth="md" className="ticket-details-container">
        <Paper elevation={3} className="ticket-details-card">
          <div className="ticket-details-header">
            <Typography variant="h4" fontWeight={700}>
              Ticket Details
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <Link to="/tickets" className="ticket-details-backlink">
                ← Back to tickets
              </Link>
            </Typography>
          </div>

          {error ? (
            <Alert severity="error" className="ticket-details-alert">
              {error}
            </Alert>
          ) : null}

          {!ticket ? (
            <Typography>No ticket.</Typography>
          ) : (
            <>
              {/* Top meta row */}
              <div className="ticket-details-meta">
                <div className="ticket-details-meta-item">
                  <Typography variant="body2" color="text.secondary">
                    ID
                  </Typography>
                  <Typography fontWeight={700}>{ticket.id}</Typography>
                </div>

                <div className="ticket-details-meta-item">
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip size="small" {...statusChipProps(ticket.status)} />
                </div>

                <div className="ticket-details-meta-item">
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip size="small" {...priorityChipProps(ticket.priority)} />
                </div>
              </div>

              <Divider sx={{ my: 2 }} />

              {/* Content */}
              <div className="ticket-details-content">
                <div className="ticket-details-block">
                  <Typography variant="body2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography fontWeight={700}>{ticket.title}</Typography>
                </div>

                <div className="ticket-details-block">
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{ticket.description || "-"}</Typography>
                </div>

                <div className="ticket-details-grid">
                  <div className="ticket-details-block">
                    <Typography variant="body2" color="text.secondary">
                      Created by
                    </Typography>
                    <Typography>
                      {ticket.created_by_user
                        ? formatUserBrief(
                            ticket.created_by_user,
                            ticket.created_by
                          )
                        : `User #${ticket.created_by}`}
                    </Typography>
                  </div>

                  <div className="ticket-details-block">
                    <Typography variant="body2" color="text.secondary">
                      Assigned to
                    </Typography>
                    <Typography>
                      {ticket.assigned_to_user
                        ? formatUserBrief(
                            ticket.assigned_to_user,
                            ticket.assigned_to
                          )
                        : ticket.assigned_to
                        ? `User #${ticket.assigned_to}`
                        : "Unassigned"}
                    </Typography>
                  </div>
                </div>
              </div>

              <Divider sx={{ my: 2 }} />

              {/* Controls */}
              <div className="ticket-details-controls">
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={draftStatus}
                    label="Status"
                    onChange={(e) => setDraftStatus(e.target.value)}
                    disabled={saving}
                  >
                    {Object.values(TICKET_STATUS).map((status) => (
                      <MenuItem key={status} value={status}>
                        {TICKET_STATUS_LABELS[status] || status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  fullWidth
                  disabled={saving || technicians.length === 0}
                >
                  <InputLabel>Assigned to</InputLabel>
                  <Select
                    value={draftAssignedTo ?? ""}
                    label="Assigned to"
                    onChange={(e) =>
                      setDraftAssignedTo(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {technicians.map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.email || tech.username || `User #${tech.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Actions */}
              <div className="ticket-details-actions">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancel}
                  disabled={saving || !isDirty}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  startIcon={saving ? <CircularProgress size={18} /> : null}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete ticket
                </Button>
              </div>

              {backendError ? (
                <Alert
                  severity="error"
                  className="ticket-details-alert"
                  sx={{ whiteSpace: "pre-line" }}
                >
                  {backendError}
                </Alert>
              ) : null}

              {/* Comments */}
              <Divider sx={{ my: 3 }} />
              <CommentsSection ticketId={ticket.id} />
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
}

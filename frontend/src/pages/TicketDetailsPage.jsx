// src/pages/TicketDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  fetchTicketById,
  updateTicketStatus,
  deleteTicket,
} from "../api/ticketsApi";

import api from "../api/httpClient";
import { fetchTechnicians } from "../api/usersApi";
import { TICKET_STATUS, TICKET_STATUS_LABELS } from "../constants/ticketStatus";
import "../styles/badges.css";
import { formatUserBrief } from "../utils/formatUser";

// Badge helpers
function getStatusBadgeClass(status) {
  switch (status) {
    case TICKET_STATUS.OPEN:
      return "badge badge--status-open";
    case TICKET_STATUS.IN_PROGRESS:
      return "badge badge--status-in-progress";
    case TICKET_STATUS.RESOLVED:
      return "badge badge--status-resolved";
    case TICKET_STATUS.CLOSED:
      return "badge badge--status-closed";
    default:
      return "badge";
  }
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case "LOW":
      return "badge badge--priority-low";
    case "MEDIUM":
      return "badge badge--priority-medium";
    case "HIGH":
      return "badge badge--priority-high";
    case "CRITICAL":
      return "badge badge--priority-critical";
    default:
      return "badge";
  }
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null); // ogólne błędy ładowania/akcji
  const [backendError, setBackendError] = useState(null); // błędy z save

  // Draft state (Save/Cancel)
  const [draftStatus, setDraftStatus] = useState("");
  const [draftAssignedTo, setDraftAssignedTo] = useState(null); // number|null

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
          // jeśli endpoint nie istnieje / 404 -> ignorujemy, dropdown będzie pusty
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

      // spróbuj wyciągnąć sensowny komunikat z DRF
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : null) ||
        e?.message ||
        "Save failed";

      setBackendError(msg);
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

  if (loading) return <p>Loading ticket...</p>;

  return (
    <div>
      <h1>Ticket Details</h1>

      <p style={{ marginBottom: 12 }}>
        <Link to="/tickets">← Back to tickets</Link>
      </p>

      {error && <p style={{ color: "crimson", marginBottom: 12 }}>{error}</p>}

      {!ticket ? (
        <p>No ticket.</p>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 12, maxWidth: 720 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <p style={{ margin: 0 }}>
              <b>ID:</b> {ticket.id}
            </p>

            <p style={{ margin: 0 }}>
              <b>Status:</b>{" "}
              <span className={getStatusBadgeClass(ticket.status)}>
                {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
              </span>
            </p>

            <p style={{ margin: 0 }}>
              <b>Priority:</b>{" "}
              <span className={getPriorityBadgeClass(ticket.priority)}>
                {ticket.priority || "-"}
              </span>
            </p>
          </div>

          <hr style={{ margin: "12px 0" }} />

          <p>
            <b>Title:</b> {ticket.title}
          </p>
          <p>
            <b>Description:</b> {ticket.description || "-"}
          </p>

          <p>
            <b>Created by:</b>{" "}
            {ticket.created_by_user
              ? formatUserBrief(ticket.created_by_user, ticket.created_by)
              : `User #${ticket.created_by}`}
          </p>

          <p>
            <b>Assigned to:</b>{" "}
            {ticket.assigned_to_user
              ? formatUserBrief(ticket.assigned_to_user, ticket.assigned_to)
              : ticket.assigned_to
              ? `User #${ticket.assigned_to}`
              : "Unassigned"}
          </p>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label>
              Status:
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                disabled={saving}
                style={{
                  marginLeft: 8,
                  padding: "6px 10px",
                  borderRadius: 6,
                }}
              >
                {Object.values(TICKET_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {TICKET_STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assigned to:
              <select
                value={draftAssignedTo ?? ""}
                onChange={(e) =>
                  setDraftAssignedTo(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                disabled={saving}
                style={{
                  marginLeft: 8,
                  padding: "6px 10px",
                  borderRadius: 6,
                  minWidth: 220,
                }}
              >
                <option value="">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.email || tech.username || `User #${tech.id}`}
                  </option>
                ))}
              </select>
            </label>

            {isDirty && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontWeight: 600,
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  Save
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    background: "#6b7280",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontWeight: 600,
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                background: "#e53935",
                color: "#fff",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 600,
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </button>
          </div>

          {backendError && (
            <div style={{ color: "#b91c1c", marginTop: 10 }}>
              {backendError}
            </div>
          )}

          {saving && <p style={{ marginTop: 10 }}>Saving...</p>}
        </div>
      )}
    </div>
  );
}

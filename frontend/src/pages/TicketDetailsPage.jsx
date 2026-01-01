import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  fetchTicketById,
  updateTicketStatus,
  deleteTicket,
} from "../api/ticketsApi";
import { TICKET_STATUS, TICKET_STATUS_LABELS } from "../constants/ticketStatus";
import "../styles/badges.css";
import { formatUserBrief } from "../utils/formatUser";
// Badge helpers
function getStatusBadgeClass(status) {
  switch (status) {
    case TICKET_STATUS.OPEN:
      return "badge badge--status-open";
    case TICKET_STATUS.IN_PROGRESS:
      return "badge badge--status-in_progress";
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

function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchTicketById(id);
        if (!data) {
          setError("Ticket not found");
          setTicket(null);
          return;
        }

        setTicket(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChangeStatus = async (newStatus) => {
    try {
      setSaving(true);
      setError(null);

      // Always send uppercase backend value
      const updated = await updateTicketStatus(id, newStatus);
      if (!updated) {
        setError("Ticket not found");
        return;
      }

      setTicket(updated);
    } catch (e) {
      console.error(e);
      setError("Failed to update status");
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

      <p style={{ marginBottom: "12px" }}>
        <Link to="/tickets">← Back to tickets</Link>
      </p>

      {error && (
        <p style={{ color: "crimson", marginBottom: "12px" }}>{error}</p>
      )}

      {!ticket ? (
        <p>No ticket.</p>
      ) : (
        <div
          style={{ border: "1px solid #ddd", padding: "12px", maxWidth: 600 }}
        >
          <p>
            <b>ID:</b> {ticket.id}
          </p>
          <p>
            <b>Title:</b> {ticket.title}
          </p>
          <p>
            <b>Description:</b> {ticket.description || "-"}
          </p>
          <p>
            <b>Status:</b>{" "}
            {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
            <span className={getStatusBadgeClass(ticket.status)}>
              {ticket.status}
            </span>
          </p>
          <p>
            <b>Priority:</b> {ticket.priority}
            <span className={getPriorityBadgeClass(ticket.priority)}>
              {ticket.priority}
            </span>
          </p>
          <p>
            <b>Created by:</b> {formatUserBrief(ticket.created_by_user, ticket.created_by)}
          </p>
          <p>
            <b>Assigned to:</b> {formatUserBrief(ticket.assigned_to_user, ticket.assigned_to)}
          </p>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <label>
              Change status:
              <select
                value={ticket.status}
                onChange={(e) => handleChangeStatus(e.target.value)}
                disabled={saving}
                style={{
                  marginLeft: 8,
                  padding: "4px 12px",
                  fontSize: 15,
                  borderRadius: 6,
                }}
              >
                {Object.values(TICKET_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {TICKET_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                background: "#e53935",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 18px",
                fontWeight: 500,
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </button>
          </div>
          {saving && <p style={{ marginTop: "8px" }}>Saving...</p>}
        </div>
      )}
    </div>
  );
}

export default TicketDetailsPage;

// frontend/src/pages/TicketDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteTicket, fetchTicketById, updateTicketStatus } from "../api/ticketsApi";
import { useUi } from "../context/UiContext";

function formatStatus(s) {
  if (!s) return "-";
  return s.replaceAll("_", " ").toLowerCase();
}

function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useUi();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTicketById(id);
      setTicket(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load ticket");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleChangeStatus = async (newStatus) => {
    try {
      setSaving(true);
      setError(null);

      const updated = await updateTicketStatus(id, newStatus);
      setTicket(updated);
      showMessage(`Status updated: ${formatStatus(updated.status)}`);
    } catch (e) {
      console.error(e);
      setError("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm("Delete this ticket?");
    if (!ok) return;

    try {
      setSaving(true);
      setError(null);
      await deleteTicket(id);
      showMessage("Ticket deleted");
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
        <div style={{ border: "1px solid #ddd", padding: 12, maxWidth: 650 }}>
          <p><b>ID:</b> {ticket.id}</p>
          <p><b>Title:</b> {ticket.title}</p>
          <p><b>Description:</b> {ticket.description || "-"}</p>
          <p><b>Status:</b> {formatStatus(ticket.status)}</p>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => handleChangeStatus("OPEN")} disabled={saving}>
              Set OPEN
            </button>
            <button onClick={() => handleChangeStatus("IN_PROGRESS")} disabled={saving}>
              Set IN PROGRESS
            </button>
            <button onClick={() => handleChangeStatus("RESOLVED")} disabled={saving}>
              Set RESOLVED
            </button>
            <button onClick={handleDelete} disabled={saving} style={{ marginLeft: 12 }}>
              Delete
            </button>
          </div>

          {saving && <p style={{ marginTop: 8 }}>Saving...</p>}
        </div>
      )}
    </div>
  );
}

export default TicketDetailsPage;

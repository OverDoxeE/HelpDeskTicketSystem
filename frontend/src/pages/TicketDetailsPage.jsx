// frontend/src/pages/TicketDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchTicketById, updateTicketStatus } from "../api/ticketsApi";

function TicketDetailsPage() {
  const { id } = useParams();

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
        <div style={{ border: "1px solid #ddd", padding: "12px", maxWidth: 600 }}>
          <p><b>ID:</b> {ticket.id}</p>
          <p><b>Title:</b> {ticket.title}</p>
          <p><b>Description:</b> {ticket.description || "-"}</p>
          <p><b>Status:</b> {ticket.status}</p>

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleChangeStatus("open")}
              disabled={saving}
            >
              Set OPEN
            </button>
            <button
              onClick={() => handleChangeStatus("in_progress")}
              disabled={saving}
            >
              Set IN PROGRESS
            </button>
            <button
              onClick={() => handleChangeStatus("closed")}
              disabled={saving}
            >
              Set CLOSED
            </button>
          </div>

          {saving && <p style={{ marginTop: "8px" }}>Saving...</p>}
        </div>
      )}
    </div>
  );
}

export default TicketDetailsPage;

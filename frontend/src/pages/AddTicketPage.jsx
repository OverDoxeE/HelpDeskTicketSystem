// frontend/src/pages/AddTicketPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/ticketsApi";
import { useUi } from "../context/UiContext";

function AddTicketPage() {
  const navigate = useNavigate();
  const { showMessage } = useUi();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const created = await createTicket({ title, description });
      showMessage("Ticket created successfully");

      navigate(`/tickets/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create ticket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>New ticket</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Title
            <input
              style={{ display: "block", width: "100%", padding: 8 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Description
            <textarea
              style={{ display: "block", width: "100%", padding: 8, minHeight: 120 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        <button disabled={saving} type="submit">
          {saving ? "Creating…" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default AddTicketPage;

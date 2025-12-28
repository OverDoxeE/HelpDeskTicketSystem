import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/ticketsApi";

function AddTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const created = await createTicket({ title, description });
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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Title
            <br />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: 400 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Description
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              style={{ width: 400 }}
            />
          </label>
        </div>

        <button type="submit" disabled={saving}>
          Create
        </button>
      </form>
    </div>
  );
}

export default AddTicketPage;

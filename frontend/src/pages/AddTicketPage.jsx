import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/ticketsApi";
import { fetchCategories } from "../api/categoriesApi";

function AddTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoadingCategories(true);
    fetchCategories()
      .then((catMap) => {
        if (mounted) {
          // Convert map to array of {id, name}
          setCategories(
            Object.entries(catMap).map(([id, name]) => ({ id, name }))
          );
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Validation
  const titleValid = title.trim().length >= 5;
  const descriptionValid = description.trim().length >= 10;
  const formValid = titleValid && descriptionValid && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBackendError(null);

    if (!formValid) {
      setError("Please fill all fields correctly.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category || null,
        due_date: null,
        status: "OPEN",
      };
      const created = await createTicket(payload);
      navigate(`/tickets/${created.id}`);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setBackendError(err.response.data);
      } else {
        setError("Failed to create ticket");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>New ticket</h1>

      {error && <p style={{ color: "crimson", marginBottom: 8 }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Title
            <br />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              style={{
                width: 440,
                borderColor: !titleValid ? "#e53935" : undefined,
              }}
            />
          </label>
          {!titleValid && (
            <div style={{ color: "#e53935", fontSize: 13 }}>
              Min. 5 characters
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Description
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
              minLength={10}
              style={{
                width: 440,
                borderColor: !descriptionValid ? "#e53935" : undefined,
              }}
            />
          </label>
          {!descriptionValid && (
            <div style={{ color: "#e53935", fontSize: 13 }}>
              Min. 10 characters
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Priority
            <br />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>
            Category
            <br />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: 320 }}
              disabled={loadingCategories}
            >
              <option value="">— None —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={!formValid}
          style={{
            width: 180,
            background: formValid ? "#1976d2" : "#b0b0b0",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 0",
            fontWeight: 600,
            fontSize: 16,
            cursor: formValid ? "pointer" : "not-allowed",
            marginBottom: 8,
            transition: "background 0.13s",
          }}
        >
          {saving ? "Creating..." : "Create"}
        </button>
      </form>

      {backendError && (
        <div style={{ marginTop: 16 }}>
          <b>Backend validation error:</b>
          <pre
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: 12,
              borderRadius: 6,
              fontSize: 14,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(backendError, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default AddTicketPage;

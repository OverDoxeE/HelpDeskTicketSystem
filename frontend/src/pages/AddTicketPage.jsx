import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

import { createTicket } from "../api/ticketsApi";
import { fetchCategories } from "../api/categoriesApi";
import "./AddTicketPage.css";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

function parseBackendError(err) {
  // axios style
  const data = err?.response?.data;
  if (!data) return null;

  if (typeof data === "string") return data;

  if (typeof data === "object") {
    // DRF validation error format: {field: ["msg1", "msg2"], ...}
    const parts = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) parts.push(`${key}: ${value.join(" ")}`);
      else if (typeof value === "string") parts.push(`${key}: ${value}`);
      else parts.push(`${key}: ${JSON.stringify(value)}`);
    }
    return parts.join("\n");
  }

  return "Validation error";
}

export default function AddTicketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState(""); // "" means None
  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetchCategories();

        // Support both formats:
        // A) array: [{id, name, ...}]
        // B) map: { "1": "Hardware", "2": "Software" }
        let normalized = [];
        if (Array.isArray(res)) {
          normalized = res.map((c) => ({
            id: Number(c.id),
            name: c.name,
          }));
        } else if (res && typeof res === "object") {
          normalized = Object.entries(res).map(([id, name]) => ({
            id: Number(id),
            name: String(name),
          }));
        }

        if (mounted) setCategories(normalized);
      } catch (e) {
        if (mounted) setCategories([]);
        console.error("Failed to load categories", e);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Frontend validation aligned with backend rules
  const titleValid = title.trim().length >= 5;
  const descriptionValid = description.trim().length >= 10;

  const formValid = useMemo(() => {
    return titleValid && descriptionValid && !saving;
  }, [titleValid, descriptionValid, saving]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBackendError("");

    if (!titleValid || !descriptionValid) {
      setError("Please fill the form correctly.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority, // LOW/MEDIUM/HIGH/CRITICAL
        category: category === "" ? null : Number(category),
      };

      const created = await createTicket(payload);
      navigate(`/tickets/${created.id}`);
    } catch (err) {
      const msg = parseBackendError(err);
      if (msg) setBackendError(msg);
      else setError("Failed to create ticket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-ticket-root">
      <Container maxWidth="md" className="add-ticket-container">
        <Paper elevation={3} className="add-ticket-card">
          <div className="add-ticket-header">
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Create new ticket
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Fill out the form below to submit a new helpdesk request.
            </Typography>
          </div>

          {error ? (
            <Alert severity="error" className="add-ticket-alert">
              {error}
            </Alert>
          ) : null}

          {backendError ? (
            <Alert
              severity="error"
              className="add-ticket-alert"
              sx={{ whiteSpace: "pre-line" }}
            >
              {backendError}
            </Alert>
          ) : null}

          <form className="add-ticket-form" onSubmit={handleSubmit}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              disabled={saving}
              error={!titleValid && title.length > 0}
              helperText={
                !titleValid && title.length > 0 ? "Minimum 5 characters" : " "
              }
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              minRows={4}
              disabled={saving}
              error={!descriptionValid && description.length > 0}
              helperText={
                !descriptionValid && description.length > 0
                  ? "Minimum 10 characters"
                  : " "
              }
            />

            <div className="add-ticket-row">
              <FormControl fullWidth disabled={saving || loadingCategories}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={saving || loadingCategories}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="add-ticket-actions">
              <Button
                variant="text"
                disabled={saving}
                onClick={() => navigate("/tickets")}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                type="submit"
                disabled={!formValid}
                startIcon={saving ? <CircularProgress size={18} /> : null}
              >
                {saving ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </div>
  );
}

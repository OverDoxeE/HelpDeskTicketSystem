// frontend/src/pages/AddTicketPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/ticketsApi';

function AddTicketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      await createTicket({ title, description });
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      setError('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>New ticket</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>
            Title:{' '}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>
            Description:{' '}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              cols={40}
            />
          </label>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </form>
    </div>
  );
}

export default AddTicketPage;

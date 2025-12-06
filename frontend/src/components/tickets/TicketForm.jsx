import React from 'react';

function TicketForm({ onSubmit, initialData }) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Title:</label>
        <input name="title" defaultValue={initialData?.title || ''} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" defaultValue={initialData?.description || ''} required />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default TicketForm;

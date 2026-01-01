import React from "react";
import { useNavigate } from "react-router-dom";
import "./ticketsTable.css";

function badge(text, type) {
  return <span className={`badge badge-${type}`}>{text}</span>;
}

function TicketsTable({ tickets, categories }) {
  const navigate = useNavigate();

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return (
      <div className="tickets-table-card">
        <p>No tickets yet.</p>
      </div>
    );
  }

  const getCategoryName = (id) => categories?.[id] || id || "—";

  return (
    <div className="tickets-table-card">
      <table className="tickets-table">
        <thead>
          <tr>
            <th className="id">ID</th>
            <th className="summary">Summary</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Category</th>
            <th>Assigned</th>
            <th>Created</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="row-clickable"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <td className="id">
                <span className="mono">{ticket.id}</span>
              </td>
              <td className="summary">
                <div className="title">{ticket.title}</div>
                <div className="desc line-clamp">{ticket.description}</div>
              </td>
              <td>{badge(ticket.status, "status")}</td>
              <td>{badge(ticket.priority, "priority")}</td>
              <td>{getCategoryName(ticket.category)}</td>
              <td>{ticket.assigned_to || "Unassigned"}</td>
              <td>
                {ticket.created_at
                  ? new Date(ticket.created_at).toLocaleString()
                  : "—"}
              </td>
              <td>
                {ticket.due_date
                  ? new Date(ticket.due_date).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketsTable;

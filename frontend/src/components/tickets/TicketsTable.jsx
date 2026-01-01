import React from "react";
import { useNavigate } from "react-router-dom";
import "./ticketsTable.css";
import "../../styles/badges.css";
import { formatUserBrief } from "../../utils/formatUser";

function formatStatusLabel(status) {
  return status?.replaceAll("_", " ") ?? "";
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "OPEN":
      return "badge badge--status-open";
    case "IN_PROGRESS":
      return "badge badge--status-in-progress";
    case "RESOLVED":
      return "badge badge--status-resolved";
    case "CLOSED":
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
              <td>
                <span className={getStatusBadgeClass(ticket.status)}>
                  {formatStatusLabel(ticket.status)}
                </span>
              </td>
              <td>
                <span className={getPriorityBadgeClass(ticket.priority)}>
                  {ticket.priority}
                </span>
              </td>
              <td>{getCategoryName(ticket.category)}</td>
              <td>{formatUserBrief(ticket.assigned_to_user, ticket.assigned_to)}</td>
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

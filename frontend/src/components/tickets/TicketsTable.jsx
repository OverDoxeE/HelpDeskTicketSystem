import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./TicketsTable.css";
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

const PRIORITY_WEIGHT = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const sorters = {
  id: (a, b) => a.id - b.id,
  status: (a, b) => (a.status || "").localeCompare(b.status || ""),
  priority: (a, b) =>
    (PRIORITY_WEIGHT[a.priority] || 0) - (PRIORITY_WEIGHT[b.priority] || 0),
  category: (a, b, categories) =>
    (categories[a.category] || "").localeCompare(categories[b.category] || ""),
  assigned: (a, b) =>
    (a.assigned_to_user?.email || "").localeCompare(
      b.assigned_to_user?.email || ""
    ),
  created_at: (a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  due_date: (a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  },
};

const SORT_KEYS = [
  { key: "id", label: "ID" },
  { key: "status", label: "Status" },
  { key: "summary", label: "Ticket" },
  { key: "priority", label: "Priority" },
  { key: "category", label: "Category" },
  { key: "assigned", label: "Assigned" },
  { key: "created_at", label: "Created" },
  { key: "due_date", label: "Due date" },
];

function TicketsTable({ tickets, categories }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  const toggleSort = (key) => {
    if (key === "summary") return;

    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
  };

  const sortedTickets = useMemo(() => {
    const arr = [...tickets];
    let key = sortKey;
    let dir = sortDir;
    if (!key || !dir) {
      key = "created_at";
      dir = "desc";
    }
    arr.sort((a, b) => {
      let cmp = 0;
      if (key === "category") {
        cmp = sorters.category(a, b, categories);
      } else if (key === "assigned") {
        cmp = sorters.assigned(a, b);
      } else if (key === "priority") {
        cmp = sorters.priority(a, b);
      } else if (key === "due_date") {
        cmp = sorters.due_date(a, b);
      } else if (key === "created_at") {
        cmp = sorters.created_at(a, b);
      } else if (key === "status") {
        cmp = sorters.status(a, b);
      } else if (key === "id") {
        cmp = sorters.id(a, b);
      }
      if (cmp === 0) {
        // Tie-breaker: id ASC
        cmp = a.id - b.id;
      }
      return dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tickets, categories, sortKey, sortDir]);

  const renderSortArrow = (key) => {
    if (sortKey !== key) return null;
    if (sortDir === "asc") return <span style={{ fontSize: 12 }}>▲</span>;
    if (sortDir === "desc") return <span style={{ fontSize: 12 }}>▼</span>;
    return null;
  };

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
            {SORT_KEYS.map(({ key, label }) => (
              <th
                key={key}
                className={key === "summary" ? "" : "sortable"}
                onClick={() => toggleSort(key)}
                style={{
                  userSelect: "none",
                  cursor: key === "summary" ? "default" : "pointer",
                }}
              >
                {label} {renderSortArrow(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((ticket) => (
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
              <td>
                {formatUserBrief(ticket.assigned_to_user, ticket.assigned_to)}
              </td>
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

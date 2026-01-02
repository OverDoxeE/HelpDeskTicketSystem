import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchComments,
  createComment,
  deleteComment,
} from "../../api/commentsApi";
import "./CommentsSection.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentsSection({ ticketId }) {
  const { user } = useAuth();

  const isAdmin =
    user?.is_admin === true ||
    user?.role === "ADMIN" ||
    (user?.groups || []).includes("ADMIN");
  const isSupportOrAdmin =
    isAdmin ||
    user?.role === "TECHNICIAN" ||
    (user?.groups || []).includes("TECHNICIAN");

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Add comment form
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setApiError(null);
    fetchComments(ticketId)
      .then((data) => {
        if (mounted) {
          setComments(
            Array.isArray(data)
              ? data.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
              : []
          );
        }
      })
      .catch(() => {
        if (mounted) setApiError("Failed to load comments");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [ticketId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(null);
    setApiError(null);
    if (message.trim().length < 3) {
      setFormError("Comment must be at least 3 characters");
      return;
    }
    setSaving(true);
    try {
      const payload = { message: message.trim() };
      if (isSupportOrAdmin) payload.visibility = visibility;
      const created = await createComment(ticketId, payload);
      setComments((prev) => [created, ...prev]);
      setMessage("");
      setVisibility("PUBLIC");
    } catch (err) {
      if (err?.response?.status === 400) {
        setApiError(
          "Validation error: " + (err.response.data?.message || "Invalid data")
        );
      } else if (err?.response?.status === 403) {
        setApiError("You don't have permission to add comments");
      } else {
        setApiError("Failed to add comment");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    setDeletingId(id);
    setApiError(null);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      if (err?.response?.status === 403) {
        setApiError("Only admins can delete comments");
      } else {
        setApiError("Failed to delete comment");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="comments-section">
      <h2>Comments ({comments.length})</h2>
      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : (
        <>
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="comments-empty">No comments yet</div>
            ) : (
              comments.map((c) => (
                <div className="comment-item" key={c.id}>
                  <div className="comment-header">
                    <div className="comment-meta">
                      <span className="comment-author">{c.author}</span>
                      <span className="comment-date">
                        {formatDate(c.created_at)}
                      </span>
                      <span
                        className={
                          "comment-badge " +
                          (c.visibility === "PUBLIC"
                            ? "comment-badge-public"
                            : "comment-badge-internal")
                        }
                      >
                        {c.visibility === "PUBLIC" ? "Public" : "Internal"}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="comment-actions">
                        <button
                          className="comment-delete-btn"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                        >
                          {deletingId === c.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="comment-message">{c.message}</div>
                </div>
              ))
            )}
          </div>
          <form className="add-comment-form" onSubmit={handleAdd}>
            <label htmlFor="comment-message">Add a comment</label>
            <textarea
              id="comment-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={formError ? "error" : ""}
              disabled={saving}
              placeholder="Type your comment here..."
            />
            {formError && <div className="add-comment-error">{formError}</div>}
            {isSupportOrAdmin && (
              <div className="add-comment-visibility">
                <label htmlFor="comment-visibility">Visibility</label>
                <select
                  id="comment-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  disabled={saving}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="INTERNAL">Internal</option>
                </select>
              </div>
            )}
            <div className="add-comment-footer">
              <button
                type="submit"
                className="add-comment-btn"
                disabled={saving || !message.trim()}
              >
                {saving ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </form>
          {apiError && <div className="api-error">{apiError}</div>}
        </>
      )}
    </div>
  );
}

import React from "react";
import { useUi } from "../../context/UiContext";

function FlashMessage() {
  const { flash, clearFlash } = useUi();

  if (!flash) return null;

  const bg =
    flash.type === "success"
      ? "#d1fae5"
      : flash.type === "error"
      ? "#fee2e2"
      : "#e5e7eb";

  const border =
    flash.type === "success"
      ? "#10b981"
      : flash.type === "error"
      ? "#ef4444"
      : "#9ca3af";

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        padding: "10px 12px",
        borderRadius: "8px",
        marginBottom: "12px",
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <span>{flash.text}</span>
      <button onClick={clearFlash} style={{ cursor: "pointer" }}>
        ✕
      </button>
    </div>
  );
}

export default FlashMessage;

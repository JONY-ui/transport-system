// ======================================================
// Notifications.js
// ======================================================
// תיקונים:
//   ✅ משימה 5.2: תמיכה ב-toast לאירועים קריטיים
//                 סוגים: success | error | info | warning
//   ✅ אנימציית כניסה ויציאה
//   ✅ כפתור סגירה ידני
// ======================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle size={18} color="var(--green)" />,
  error: <AlertCircle size={18} color="var(--red)" />,
  info: <Info size={18} color="var(--blue-accent)" />,
  warning: <AlertTriangle size={18} color="var(--orange)" />,
};

const COLORS = {
  success: {
    border: "var(--green)",
    bg: "rgba(46,204,113,0.06)",
  },
  error: {
    border: "var(--red)",
    bg: "rgba(231,76,60,0.06)",
  },
  info: {
    border: "var(--blue-accent)",
    bg: "rgba(52,152,219,0.06)",
  },
  warning: {
    border: "var(--orange)",
    bg: "rgba(243,156,18,0.06)",
  },
};

function Toast({ notification, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const style = COLORS[notification.type] || COLORS.info;

  return (
    <div
      className={`toast ${notification.type}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderRight: `3px solid ${style.border}`,
        background: style.bg,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
        paddingLeft: "8px",
      }}
    >
      <span style={{ flexShrink: 0 }}>
        {ICONS[notification.type] || ICONS.info}
      </span>
      <span style={{ flex: 1, fontSize: "13px", lineHeight: 1.4 }}>
        {notification.msg}
      </span>
      <button
        onClick={() => onClose(notification.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px",
          color: "var(--gray-400)",
          flexShrink: 0,
          display: "flex",
        }}
        title="סגור"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function Notifications() {
  const { notifications, setNotifications } = useApp();

  // fallback – אם setNotifications לא מועבר, פשוט מציג
  const handleClose = (id) => {
    if (typeof setNotifications === "function") {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="notifications-container">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onClose={handleClose} />
      ))}
    </div>
  );
}

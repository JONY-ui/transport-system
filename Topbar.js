import { useState, useEffect } from "react";
import { Bell, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

const pageTitles = {
  dashboard: "דשבורד ראשי",
  monitor: "ניטור חי - מפת נהגים",
  routes: "ניהול מסלולים",
  drivers: "ניהול נהגים",
  ivr: "מערכת IVR טלפוני",
  reports: "דוחות וניתוחים",
  settings: "הגדרות מערכת",
};

export default function Topbar({ currentPage }) {
  const { drivers } = useApp();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeCount = drivers.filter(d => d.status !== "offline").length;

  const formatTime = (d) =>
    d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d) =>
    d.toLocaleDateString("he-IL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="topbar">
      <div className="topbar-title">{pageTitles[currentPage] || "מערכת ניהול הסעות"}</div>

      <div className="topbar-actions">
        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(46,204,113,0.08)",
          border: "1px solid rgba(46,204,113,0.2)",
          borderRadius: "20px", padding: "6px 14px",
          fontSize: "13px", color: "var(--green-dark)", fontWeight: 600
        }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "var(--green)", animation: "pulse 1.5s infinite"
          }} />
          {activeCount} נהגים פעילים
        </div>

        {/* Time */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "13px", color: "var(--gray-500)"
        }}>
          <Clock size={14} />
          <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>{formatTime(time)}</span>
          <span style={{ color: "var(--gray-400)" }}>|</span>
          <span>{formatDate(time)}</span>
        </div>

        {/* Bell */}
        <div style={{
          position: "relative", cursor: "pointer",
          padding: "8px", borderRadius: "8px",
          transition: "background 0.2s",
        }}>
          <Bell size={20} color="var(--gray-500)" />
          <span style={{
            position: "absolute", top: "5px", right: "5px",
            width: "8px", height: "8px", borderRadius: "50%",
            background: "var(--red)", border: "2px solid white"
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

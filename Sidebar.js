import {
  LayoutDashboard, Bus, Route, Users, PhoneCall,
  BarChart3, Settings, LogOut, Radio
} from "lucide-react";
import { useApp } from "../context/AppContext";

const navItems = [
  { id: "dashboard", label: "דשבורד", icon: LayoutDashboard, badge: null },
  { id: "monitor", label: "ניטור חי", icon: Radio, badge: "חי", badgeColor: "green" },
  { id: "routes", label: "ניהול מסלולים", icon: Route, badge: null },
  { id: "drivers", label: "ניהול נהגים", icon: Users, badge: null },
  { id: "ivr", label: "מערכת IVR", icon: PhoneCall, badge: null },
  { id: "reports", label: "דוחות", icon: BarChart3, badge: null },
  { id: "settings", label: "הגדרות", icon: Settings, badge: null },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout, drivers } = useApp();

  const offlineCount = drivers.filter(d => d.status === "offline").length;

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("")
    : "מ";

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Bus size={28} color="white" strokeWidth={1.5} />
        </div>
        <h1>מערכת הסעות</h1>
        <p>פאנל ניהול</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">ניהול ראשי</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const badge = item.id === "drivers" && offlineCount > 0
            ? offlineCount.toString()
            : item.badge;
          const badgeColor = item.id === "drivers" ? "orange" : item.badgeColor;

          return (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="nav-icon" />
              {item.label}
              {badge && (
                <span className={`nav-badge ${badgeColor || ""}`}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || "מנהל מערכת"}</div>
            <div className="user-role">מנהל ראשי</div>
          </div>
          <button className="logout-btn" onClick={logout} title="התנתקות">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

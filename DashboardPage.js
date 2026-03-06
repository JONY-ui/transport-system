import { useApp } from "../context/AppContext";
import {
  Bus, Users, Clock, TrendingUp, PhoneCall,
  AlertTriangle, CheckCircle, MapPin, Zap
} from "lucide-react";

function StatCard({ value, label, change, icon: Icon, iconClass, suffix = "" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="stat-value">{value}{suffix}</div>
        <div className="stat-label">{label}</div>
        {change && (
          <div className={`stat-change ${change.startsWith("+") ? "up" : "down"}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { drivers, routes, stats, liveLocations } = useApp();

  const drivingCount = drivers.filter(d => d.status === "driving").length;
  const onlineCount = drivers.filter(d => d.status === "online").length;
  const offlineCount = drivers.filter(d => d.status === "offline").length;
  const delayedRoutes = routes.filter(r => r.status === "delayed");

  const recentActivity = [
    { type: "success", msg: "משה כהן הגיע לתחנה 3 – כיכר דיזנגוף", time: "לפני 2 דק'" },
    { type: "warning", msg: "עיכוב של 8 דקות במסלול פתח תקווה", time: "לפני 5 דק'" },
    { type: "info", msg: "דוד לוי התחבר למערכת", time: "לפני 7 דק'" },
    { type: "success", msg: "מסלול גבעתיים הושלם בהצלחה", time: "לפני 12 דק'" },
    { type: "warning", msg: "שיחת IVR – תלמיד ביקש ETA תחנה 5", time: "לפני 15 דק'" },
    { type: "info", msg: "ניר גולן התנתק מהמערכת", time: "לפני 20 דק'" },
  ];

  const activityIcons = {
    success: <CheckCircle size={15} color="var(--green)" />,
    warning: <AlertTriangle size={15} color="var(--orange)" />,
    info: <Zap size={15} color="var(--blue-accent)" />,
  };

  return (
    <div className="page-container">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard value={drivingCount} label="נוהגים כעת" icon={Bus} iconClass="green" change="+3 מאתמול" />
        <StatCard value={onlineCount} label="מחובר / ממתין" icon={Users} iconClass="blue" />
        <StatCard value={offlineCount} label="לא מחובר" icon={Users} iconClass="red" />
        <StatCard value={stats.totalStudentsToday} label="תלמידים היום" icon={Users} iconClass="navy" />
        <StatCard value={stats.avgDelay} label="עיכוב ממוצע" suffix=" דק'" icon={Clock} iconClass="orange" />
        <StatCard value={stats.ivrCallsToday} label="שיחות IVR היום" icon={PhoneCall} iconClass="blue" change="+12%" />
        <StatCard value={routes.filter(r => r.status === "active").length} label="מסלולים פעילים" icon={MapPin} iconClass="green" />
        <StatCard value={stats.routesCompleted} label="מסלולים הושלמו" icon={TrendingUp} iconClass="navy" />
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>

        {/* Active routes table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><MapPin size={18} color="var(--navy)" />מסלולים פעילים כעת</div>
            <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>
              {routes.filter(r => r.status === "active").length} פעיל
            </span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>שם מסלול</th>
                  <th>נהג</th>
                  <th>תחנה הבאה</th>
                  <th>ETA</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(route => {
                  const driver = drivers.find(d => d.id === route.assignedDriverUid);
                  const loc = liveLocations[route.assignedDriverUid];
                  const nextStop = route.stops[loc?.nextStopIndex ?? 0];
                  return (
                    <tr key={route.id}>
                      <td style={{ fontWeight: 600 }}>{route.name}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "8px",
                            background: "linear-gradient(135deg, var(--navy-light), var(--blue-accent))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: "11px", fontWeight: 700
                          }}>
                            {driver?.name?.split(" ").map(w => w[0]).join("") || "??"}
                          </div>
                          <span>{driver?.name || "לא מוקצה"}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--gray-600)", fontSize: "13px" }}>
                        {nextStop?.name || "–"}
                      </td>
                      <td>
                        {loc ? (
                          <span className={`eta-badge ${route.status === "delayed" ? "delayed" : ""}`}>
                            {loc.etaToNext} דק'
                          </span>
                        ) : "–"}
                      </td>
                      <td>
                        <span className={`badge status-${route.status}`}>
                          <span className="badge-dot" />
                          {route.status === "active" ? "פעיל" : route.status === "delayed" ? "עיכוב" : "הושלם"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Alerts */}
          {delayedRoutes.length > 0 && (
            <div className="card" style={{ borderRight: "4px solid var(--orange)" }}>
              <div className="card-header">
                <div className="card-title" style={{ color: "var(--orange)" }}>
                  <AlertTriangle size={16} />
                  התראות פעילות
                </div>
                <span className="badge" style={{ background: "rgba(243,156,18,0.1)", color: "var(--orange)" }}>
                  {delayedRoutes.length}
                </span>
              </div>
              {delayedRoutes.map(r => (
                <div key={r.id} style={{
                  padding: "10px 14px", background: "rgba(243,156,18,0.06)",
                  borderRadius: "8px", marginBottom: "8px", fontSize: "13px"
                }}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: "var(--gray-500)", marginTop: "2px" }}>
                    עיכוב בהגעה לתחנה הבאה
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity feed */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title"><Zap size={16} color="var(--blue-accent)" />פעילות אחרונה</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentActivity.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "10px 0",
                  borderBottom: i < recentActivity.length - 1 ? "1px solid var(--gray-100)" : "none"
                }}>
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>
                    {activityIcons[item.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "var(--gray-700)", lineHeight: 1.4 }}>
                      {item.msg}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--gray-400)", marginTop: "3px" }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

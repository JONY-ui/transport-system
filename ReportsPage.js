import { useState } from "react";
import { useApp } from "../context/AppContext";
import { BarChart3, TrendingUp, TrendingDown, Download, Calendar, Clock } from "lucide-react";

// Simple bar chart component
function BarChart({ data, color = "var(--navy)" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", padding: "8px 0" }}>
      {data.map((item, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{ fontSize: "10px", color: "var(--gray-500)", fontWeight: 600 }}>{item.value}</div>
          <div style={{
            width: "100%", borderRadius: "6px 6px 0 0",
            background: color,
            height: `${(item.value / max) * 90}px`,
            minHeight: "4px",
            transition: "height 0.5s ease",
          }} />
          <div style={{ fontSize: "10px", color: "var(--gray-500)" }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Line chart (simple SVG)
function LineChart({ data, color = "#2ecc71" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 400, h = 100, pad = 20;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100px" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={data.map((d, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          const y = h - pad - (d.value / max) * (h - pad * 2);
          return `${x},${y}`;
        }).join(" ")}
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - (d.value / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

export default function ReportsPage() {
  const { drivers, routes } = useApp();
  const [dateRange, setDateRange] = useState("week");

  const weeklyIVR = [
    { label: "א'", value: 214 },
    { label: "ב'", value: 198 },
    { label: "ג'", value: 245 },
    { label: "ד'", value: 189 },
    { label: "ה'", value: 234 },
    { label: "ו'", value: 67 },
    { label: "ש'", value: 12 },
  ];

  const weeklyDelays = [
    { label: "א'", value: 2.1 },
    { label: "ב'", value: 4.5 },
    { label: "ג'", value: 1.8 },
    { label: "ד'", value: 6.2 },
    { label: "ה'", value: 3.4 },
    { label: "ו'", value: 1.2 },
    { label: "ש'", value: 0 },
  ];

  const weeklyStudents = [
    { label: "א'", value: 820 },
    { label: "ב'", value: 847 },
    { label: "ג'", value: 831 },
    { label: "ד'", value: 858 },
    { label: "ה'", value: 812 },
  ];

  const topDrivers = [
    { name: "משה כהן", routes: 22, onTime: 96, delay: 1.2 },
    { name: "דוד לוי", routes: 20, onTime: 94, delay: 2.1 },
    { name: "אמיר בן דוד", routes: 19, onTime: 88, delay: 4.5 },
    { name: "רונן שלום", routes: 21, onTime: 99, delay: 0.8 },
    { name: "יוסף אברהם", routes: 15, onTime: 91, delay: 3.2 },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--navy)" }}>דוחות וניתוחים</h2>
          <p style={{ fontSize: "14px", color: "var(--gray-500)", marginTop: "4px" }}>נתוני ביצועים של המערכת</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {["week", "month", "quarter"].map(r => (
            <button
              key={r}
              className={`btn btn-sm ${dateRange === r ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setDateRange(r)}
            >
              {r === "week" ? "שבוע" : r === "month" ? "חודש" : "רבעון"}
            </button>
          ))}
          <button className="btn btn-sm btn-outline">
            <Download size={14} /> ייצוא Excel
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "ס\"ה נסיעות", value: "116", change: "+8%", up: true, icon: TrendingUp },
          { label: "דייקנות ממוצעת", value: "93.4%", change: "+2.1%", up: true, icon: TrendingUp },
          { label: "עיכוב ממוצע", value: "3.2 דק'", change: "-0.5", up: false, icon: TrendingDown },
          { label: "שיחות IVR", value: "1,159", change: "+12%", up: true, icon: TrendingUp },
        ].map(kpi => (
          <div className="card" key={kpi.label} style={{ textAlign: "center" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: kpi.up ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <kpi.icon size={20} color={kpi.up ? "var(--green-dark)" : "var(--red)"} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--navy)" }}>{kpi.value}</div>
            <div style={{ fontSize: "12px", color: "var(--gray-500)", margin: "4px 0" }}>{kpi.label}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: kpi.up ? "var(--green-dark)" : "var(--red)" }}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "12px" }}>
            <BarChart3 size={15} color="var(--navy)" />
            שיחות IVR לפי יום
          </div>
          <BarChart data={weeklyIVR} color="var(--navy)" />
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "12px" }}>
            <Clock size={15} color="var(--orange)" />
            עיכוב ממוצע (דקות)
          </div>
          <BarChart data={weeklyDelays} color="var(--orange)" />
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "12px" }}>
            <TrendingUp size={15} color="var(--green-dark)" />
            תלמידים יומיים
          </div>
          <LineChart data={weeklyStudents} color="#2ecc71" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--gray-400)", marginTop: "4px" }}>
            {weeklyStudents.map(d => <span key={d.label}>{d.label}</span>)}
          </div>
        </div>
      </div>

      {/* Driver performance table */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div className="card-title"><TrendingUp size={16} color="var(--navy)" />ביצועי נהגים</div>
          <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>שבוע נוכחי</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>נהג</th>
                <th>מסלולים</th>
                <th>דייקנות</th>
                <th>עיכוב ממוצע</th>
                <th>ציון</th>
              </tr>
            </thead>
            <tbody>
              {topDrivers.sort((a, b) => b.onTime - a.onTime).map((d, i) => (
                <tr key={d.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        background: i === 0 ? "linear-gradient(135deg, #f39c12, #f1c40f)" :
                          i === 1 ? "linear-gradient(135deg, #bdc3c7, #95a5a6)" :
                            i === 2 ? "linear-gradient(135deg, #cd7f32, #a0522d)" :
                              "var(--gray-200)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 800,
                        color: i < 3 ? "white" : "var(--gray-500)",
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--navy)" }}>{d.routes}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        flex: 1, height: "6px", background: "var(--gray-200)", borderRadius: "3px", overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%", borderRadius: "3px",
                          width: `${d.onTime}%`,
                          background: d.onTime >= 95 ? "var(--green)" : d.onTime >= 90 ? "var(--orange)" : "var(--red)",
                        }} />
                      </div>
                      <span style={{
                        fontWeight: 700, fontSize: "13px",
                        color: d.onTime >= 95 ? "var(--green-dark)" : d.onTime >= 90 ? "var(--orange)" : "var(--red)",
                      }}>{d.onTime}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 600, fontSize: "13px",
                      color: d.delay < 2 ? "var(--green-dark)" : d.delay < 4 ? "var(--orange)" : "var(--red)",
                    }}>
                      {d.delay} דק'
                    </span>
                  </td>
                  <td>
                    <div style={{
                      display: "inline-flex",
                      background: d.onTime >= 95 ? "rgba(46,204,113,0.1)" : d.onTime >= 90 ? "rgba(243,156,18,0.1)" : "rgba(231,76,60,0.1)",
                      color: d.onTime >= 95 ? "var(--green-dark)" : d.onTime >= 90 ? "var(--orange)" : "var(--red)",
                      padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 800,
                    }}>
                      {d.onTime >= 95 ? "מצוין" : d.onTime >= 90 ? "טוב" : "לשיפור"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route summary */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Calendar size={16} color="var(--navy)" />סיכום מסלולים השבוע</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          {routes.map(r => {
            const totalStudents = r.stops.reduce((sum, s) => sum + (s.studentsCount || 0), 0);
            const onTime = Math.floor(Math.random() * 15 + 80);
            return (
              <div key={r.id} style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: "12px", padding: "14px"
              }}>
                <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px", color: "var(--navy)" }}>
                  {r.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--gray-600)", lineHeight: "1.8" }}>
                  <div>תלמידים: <strong>{totalStudents}</strong></div>
                  <div>תחנות: <strong>{r.stops.length}</strong></div>
                  <div>דייקנות: <strong style={{ color: onTime >= 90 ? "var(--green-dark)" : "var(--orange)" }}>{onTime}%</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

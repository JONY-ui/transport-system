import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { MapPin, Navigation, Clock, Zap, Users } from "lucide-react";

// Simple SVG Map of Israel with animated driver markers
function LiveMapSVG({ drivers, routes, liveLocations, selectedDriver, onSelect }) {
  // Convert lat/lng to SVG coordinates (rough Israel bounds)
  const toSVG = (lat, lng) => {
    const minLat = 29.5, maxLat = 33.3;
    const minLng = 34.2, maxLng = 35.9;
    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 40;
    return { x, y };
  };

  const driverColors = {
    driving: "#2ecc71",
    online: "#3498db",
    offline: "#adb5bd",
  };

  return (
    <svg viewBox="0 0 800 600" style={{ width: "100%", height: "100%", background: "#e8f0f8" }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c8d8e8" strokeWidth="0.5" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="800" height="600" fill="url(#grid)" />

      {/* Israel shape (simplified) */}
      <path
        d="M 400 50 L 580 120 L 650 200 L 620 350 L 550 420 L 480 500 L 420 560 L 380 500 L 320 420 L 260 350 L 200 280 L 220 180 L 280 120 Z"
        fill="#d4e8d4" stroke="#b8d8b8" strokeWidth="2" opacity="0.6"
      />

      {/* Road lines (stylized) */}
      <line x1="300" y1="100" x2="500" y2="450" stroke="#c8d0c8" strokeWidth="3" strokeDasharray="8,4" opacity="0.5" />
      <line x1="200" y1="200" x2="600" y2="300" stroke="#c8d0c8" strokeWidth="3" strokeDasharray="8,4" opacity="0.5" />
      <line x1="350" y1="150" x2="450" y2="400" stroke="#c8d0c8" strokeWidth="2" strokeDasharray="5,3" opacity="0.4" />

      {/* Route paths */}
      {routes.map((route, ri) => {
        const colors = ["#3498db", "#9b59b6", "#e67e22", "#1abc9c"];
        const color = colors[ri % colors.length];
        const points = route.stops.map(s => {
          const { x, y } = toSVG(s.lat, s.lng);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polyline
            key={route.id}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="8,4"
            opacity="0.4"
          />
        );
      })}

      {/* Stop markers */}
      {routes.map(route =>
        route.stops.map(stop => {
          const { x, y } = toSVG(stop.lat, stop.lng);
          return (
            <g key={stop.stopId}>
              <circle cx={x} cy={y} r="5" fill="white" stroke="#3498db" strokeWidth="2" />
              <circle cx={x} cy={y} r="2.5" fill="#3498db" />
            </g>
          );
        })
      )}

      {/* Driver markers */}
      {drivers.filter(d => d.status !== "offline").map(driver => {
        const loc = liveLocations[driver.id];
        if (!loc) return null;
        const { x, y } = toSVG(loc.lat, loc.lng);
        const color = driverColors[driver.status];
        const isSelected = selectedDriver === driver.id;
        const initials = driver.name.split(" ").map(w => w[0]).join("").slice(0, 2);

        return (
          <g
            key={driver.id}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(driver.id)}
          >
            {/* Pulse ring */}
            {driver.status === "driving" && (
              <circle cx={x} cy={y} r="18" fill={color} opacity="0.15">
                <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle cx={x} cy={y} r="22" fill="none" stroke="#f39c12" strokeWidth="2.5">
                <animate attributeName="r" values="20;26;20" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Main marker */}
            <circle cx={x} cy={y} r="14" fill={color} filter={isSelected ? "url(#glow)" : ""} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="9" fontWeight="bold" fontFamily="Rubik, sans-serif">
              {initials}
            </text>

            {/* Tooltip on hover */}
            <title>{driver.name} | {loc.speed?.toFixed(0)} קמ"ש | ETA: {loc.etaToNext} דק'</title>
          </g>
        );
      })}

      {/* City labels */}
      {[
        { name: "תל אביב", lat: 32.07, lng: 34.78 },
        { name: "רמת גן", lat: 32.07, lng: 34.81 },
        { name: "פ\"ת", lat: 32.09, lng: 34.89 },
        { name: "הרצליה", lat: 32.16, lng: 34.84 },
      ].map(city => {
        const { x, y } = toSVG(city.lat, city.lng);
        return (
          <text key={city.name} x={x + 16} y={y + 4}
            fill="#666" fontSize="10" fontFamily="Rubik, sans-serif" fontWeight="500">
            {city.name}
          </text>
        );
      })}
    </svg>
  );
}

export default function MonitorPage() {
  const { drivers, routes, liveLocations } = useApp();
  const [selectedDriver, setSelectedDriver] = useState(null);

  const selected = drivers.find(d => d.id === selectedDriver);
  const selectedLoc = selectedDriver ? liveLocations[selectedDriver] : null;
  const selectedRoute = selected ? routes.find(r => r.id === selected.currentRouteId) : null;

  const activeDrivers = drivers.filter(d => d.status !== "offline");

  return (
    <div className="page-container" style={{ padding: "20px", height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", flex: 1, minHeight: 0 }}>

        {/* Map */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid var(--gray-200)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div className="card-title">
              <MapPin size={16} color="var(--navy)" />
              מפת ניטור חי
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
              {[
                { color: "#2ecc71", label: "נוהג" },
                { color: "#3498db", label: "מחובר" },
                { color: "#adb5bd", label: "לא פעיל" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color }} />
                  <span style={{ color: "var(--gray-600)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <LiveMapSVG
              drivers={drivers}
              routes={routes}
              liveLocations={liveLocations}
              selectedDriver={selectedDriver}
              onSelect={setSelectedDriver}
            />
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" }}>

          {/* Selected driver detail */}
          {selected && selectedLoc ? (
            <div className="card" style={{ borderTop: "4px solid var(--green)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: "linear-gradient(135deg, var(--navy-light), var(--blue-accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "16px", fontWeight: 700
                }}>
                  {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{selected.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--gray-500)" }}>{selected.vehicleNumber}</div>
                </div>
                <span className={`badge ${selected.status}`} style={{ marginRight: "auto" }}>
                  <span className="badge-dot" />
                  {selected.status === "driving" ? "נוהג" : "מחובר"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                {[
                  { label: "מהירות", value: `${selectedLoc.speed?.toFixed(0)} קמ"ש`, icon: Zap },
                  { label: "ETA הבאה", value: `${selectedLoc.etaToNext} דק'`, icon: Clock },
                ].map(item => (
                  <div key={item.label} style={{
                    background: "var(--gray-100)", borderRadius: "10px",
                    padding: "12px", textAlign: "center"
                  }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--navy)" }}>{item.value}</div>
                    <div style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "2px" }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {selectedRoute && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--gray-600)", marginBottom: "8px" }}>
                    מסלול: {selectedRoute.name}
                  </div>
                  {selectedRoute.stops.map((stop, i) => {
                    const isNext = i === (selectedLoc.nextStopIndex || 0);
                    const isDone = i < (selectedLoc.nextStopIndex || 0);
                    return (
                      <div key={stop.stopId} className="stop-item">
                        <div className={`stop-bullet ${isNext ? "active" : isDone ? "completed" : ""}`}>
                          {isDone ? "✓" : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>{stop.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>{stop.address}</div>
                        </div>
                        {isNext && (
                          <span className="eta-badge">{selectedLoc.etaToNext} דק'</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "32px 20px", color: "var(--gray-400)" }}>
              <Navigation size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: "14px" }}>לחץ על נהג במפה לצפות בפרטים</div>
            </div>
          )}

          {/* Active drivers list */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Users size={16} />נהגים פעילים</div>
              <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>{activeDrivers.length}</span>
            </div>
            <div>
              {activeDrivers.map(driver => {
                const loc = liveLocations[driver.id];
                return (
                  <div
                    key={driver.id}
                    className="driver-list-item"
                    style={{
                      cursor: "pointer",
                      background: selectedDriver === driver.id ? "rgba(0,51,102,0.04)" : "transparent",
                      borderRadius: "8px", padding: "10px 8px", margin: "0 -8px"
                    }}
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    <div className="driver-avatar" style={{ width: "36px", height: "36px", fontSize: "12px", borderRadius: "10px" }}>
                      {driver.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>
                        {loc ? `${loc.speed?.toFixed(0)} קמ"ש` : "–"}
                      </div>
                    </div>
                    <span className={`badge ${driver.status}`} style={{ fontSize: "10px", padding: "3px 8px" }}>
                      <span className="badge-dot" />
                      {driver.status === "driving" ? "נוהג" : "ממתין"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

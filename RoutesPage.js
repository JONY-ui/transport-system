// ======================================================
// RoutesPage.js
// ======================================================
// תיקונים:
//   ✅ משימה 4.1: eta-badge מקבל צבע דינמי לפי רמת עיכוב
//                 > 5 דק' → כתום (--orange)
//                 > 10 דק' → אדום (--red)
//                 תקין → ירוק (--green)
//   ✅ ולידציה של שם מסלול לפני שמירה
//   ✅ כפתור "שנה סטטוס" לאיפוס מסלול מ-delayed ל-active
// ======================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Plus, Search, Edit2, Trash2, X, MapPin,
  Clock, Users, ChevronDown, ChevronUp, Route,
  RefreshCw,
} from "lucide-react";

// ────────────────────────────────────────────────────────
// ETA Badge – צובע לפי רמת עיכוב (משימה 4.1)
// ────────────────────────────────────────────────────────
function EtaBadge({ minutes }) {
  if (!minutes && minutes !== 0)
    return <span style={{ color: "var(--gray-400)" }}>–</span>;

  const color =
    minutes > 10
      ? "var(--red)"
      : minutes > 5
      ? "var(--orange)"
      : "var(--green-dark)";

  const bg =
    minutes > 10
      ? "rgba(231,76,60,0.1)"
      : minutes > 5
      ? "rgba(243,156,18,0.1)"
      : "rgba(46,204,113,0.1)";

  return (
    <span
      className="eta-badge"
      style={{ background: bg, color, fontWeight: 700 }}
    >
      {minutes} דק'
      {minutes > 5 && (
        <span style={{ marginRight: "3px", fontSize: "10px" }}>⚠</span>
      )}
    </span>
  );
}

// ────────────────────────────────────────────────────────
// Route Modal
// ────────────────────────────────────────────────────────
function RouteModal({ route, drivers, onClose, onSave }) {
  const [form, setForm] = useState(
    route || {
      name: "",
      assignedDriverUid: "",
      schedule: {
        startTime: "07:00",
        endTime: "08:30",
        days: ["א'", "ב'", "ג'", "ד'", "ה'"],
      },
      stops: [],
    }
  );
  const [newStop, setNewStop] = useState({
    name: "",
    address: "",
    estimatedTime: "",
    studentsCount: 0,
  });
  const [nameError, setNameError] = useState("");

  const addStop = () => {
    if (!newStop.name.trim()) return;
    setForm((p) => ({
      ...p,
      stops: [
        ...p.stops,
        {
          ...newStop,
          stopId: `s${Date.now()}`,
          lat: 32.07 + Math.random() * 0.1,
          lng: 34.78 + Math.random() * 0.1,
          order: p.stops.length + 1,
          studentsCount: parseInt(newStop.studentsCount) || 0,
        },
      ],
    }));
    setNewStop({ name: "", address: "", estimatedTime: "", studentsCount: 0 });
  };

  const removeStop = (stopId) => {
    setForm((p) => ({
      ...p,
      stops: p.stops.filter((s) => s.stopId !== stopId),
    }));
  };

  const daysList = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
  const toggleDay = (day) => {
    setForm((p) => ({
      ...p,
      schedule: {
        ...p.schedule,
        days: p.schedule.days.includes(day)
          ? p.schedule.days.filter((d) => d !== day)
          : [...p.schedule.days, day],
      },
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setNameError("שם המסלול חובה");
      return;
    }
    setNameError("");
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: "620px" }}>
        <div className="modal-header">
          <div className="modal-title">
            {route ? "עריכת מסלול" : "הוספת מסלול חדש"}
          </div>
          <button className="btn btn-icon btn-outline" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">שם המסלול</label>
            <input
              className="form-input"
              placeholder="מסלול תל אביב צפון"
              value={form.name}
              style={nameError ? { borderColor: "var(--red)" } : {}}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setNameError("");
              }}
            />
            {nameError && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--red)",
                  marginTop: "4px",
                }}
              >
                {nameError}
              </div>
            )}
          </div>

          {/* Driver */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">נהג מוקצה</label>
            <select
              className="form-select"
              value={form.assignedDriverUid}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  assignedDriverUid: e.target.value,
                }))
              }
            >
              <option value="">-- בחר נהג --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehicleNumber || "ללא רכב"})
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label className="form-label">לוח זמנים</label>
            <div
              style={{ display: "flex", gap: "12px", marginBottom: "10px" }}
            >
              {[
                { key: "startTime", label: "שעת התחלה" },
                { key: "endTime", label: "שעת סיום" },
              ].map((f) => (
                <div
                  key={f.key}
                  className="form-group"
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <label
                    className="form-label"
                    style={{ fontSize: "11px" }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.schedule[f.key]}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        schedule: {
                          ...p.schedule,
                          [f.key]: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {daysList.map((day) => (
                <button
                  key={day}
                  type="button"
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: `2px solid ${
                      form.schedule.days.includes(day)
                        ? "var(--navy)"
                        : "var(--gray-300)"
                    }`,
                    background: form.schedule.days.includes(day)
                      ? "var(--navy)"
                      : "white",
                    color: form.schedule.days.includes(day)
                      ? "white"
                      : "var(--gray-600)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Stops */}
          <div>
            <label className="form-label">
              תחנות ({form.stops.length})
            </label>
            {form.stops.map((stop, i) => (
              <div
                key={stop.stopId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "var(--gray-100)",
                  borderRadius: "8px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "var(--navy)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {stop.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--gray-500)",
                    }}
                  >
                    {stop.address} | {stop.estimatedTime} |{" "}
                    {stop.studentsCount} תלמידים
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  style={{ padding: "4px" }}
                  onClick={() => removeStop(stop.stopId)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Add stop */}
            <div
              style={{
                border: "2px dashed var(--gray-300)",
                borderRadius: "10px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <input
                className="form-input"
                style={{ fontSize: "13px" }}
                placeholder="שם תחנה"
                value={newStop.name}
                onChange={(e) =>
                  setNewStop((p) => ({ ...p, name: e.target.value }))
                }
              />
              <input
                className="form-input"
                style={{ fontSize: "13px" }}
                placeholder="כתובת"
                value={newStop.address}
                onChange={(e) =>
                  setNewStop((p) => ({ ...p, address: e.target.value }))
                }
              />
              <input
                type="time"
                className="form-input"
                style={{ fontSize: "13px" }}
                value={newStop.estimatedTime}
                onChange={(e) =>
                  setNewStop((p) => ({
                    ...p,
                    estimatedTime: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                className="form-input"
                style={{ fontSize: "13px" }}
                placeholder="מס' תלמידים"
                min="0"
                value={newStop.studentsCount}
                onChange={(e) =>
                  setNewStop((p) => ({
                    ...p,
                    studentsCount: e.target.value,
                  }))
                }
              />
              <button
                className="btn btn-outline btn-sm"
                style={{ gridColumn: "span 2" }}
                onClick={addStop}
              >
                <Plus size={14} /> הוסף תחנה
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            {route ? "שמור שינויים" : "צור מסלול"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────
export default function RoutesPage() {
  const {
    routes,
    drivers,
    liveLocations,
    addRoute,
    updateRoute,
    deleteRoute,
  } = useApp();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = routes.filter(
    (r) =>
      r.name.includes(search) ||
      drivers.find((d) => d.id === r.assignedDriverUid)?.name?.includes(search)
  );

  const handleSave = (form) => {
    if (modal.mode === "edit") {
      updateRoute(modal.route.id, form);
    } else {
      addRoute(form);
    }
    setModal(null);
  };

  // איפוס סטטוס delayed ל-active
  const resetRouteStatus = (route) => {
    updateRoute(route.id, { status: "active" });
  };

  return (
    <div className="page-container">
      {/* ── Modals ── */}
      {modal && (
        <RouteModal
          route={modal.route}
          drivers={drivers}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteConfirm(null)
          }
        >
          <div className="modal" style={{ maxWidth: "380px" }}>
            <div className="modal-header">
              <div
                className="modal-title"
                style={{ color: "var(--red)" }}
              >
                מחיקת מסלול
              </div>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--gray-600)" }}>
                האם למחוק את מסלול{" "}
                <strong>{deleteConfirm.name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteRoute(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
              >
                מחק
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setDeleteConfirm(null)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--navy)",
            }}
          >
            ניהול מסלולים
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--gray-500)",
              marginTop: "4px",
            }}
          >
            {routes.length} מסלולים רשומים
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ mode: "add", route: null })}
        >
          <Plus size={18} /> הוסף מסלול חדש
        </button>
      </div>

      {/* ── Search ── */}
      <div
        className="search-input-wrapper"
        style={{ marginBottom: "20px" }}
      >
        <Search size={16} className="search-icon" />
        <input
          className="form-input"
          placeholder="חפש מסלול או נהג..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Routes List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((route) => {
          const driver = drivers.find(
            (d) => d.id === route.assignedDriverUid
          );
          const loc = liveLocations[route.assignedDriverUid];
          const isExpanded = expanded === route.id;
          const totalStudents = route.stops.reduce(
            (sum, s) => sum + (s.studentsCount || 0),
            0
          );
          const isDelayed = route.status === "delayed";

          const headerBg = isDelayed
            ? "linear-gradient(135deg, #7d5a00, #b8860b)"
            : route.status === "completed"
            ? "var(--gray-700)"
            : "linear-gradient(135deg, var(--navy), var(--navy-mid))";

          return (
            <div
              className="card"
              key={route.id}
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* Card header */}
              <div
                style={{
                  background: headerBg,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Route size={20} color="white" />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {route.name}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "12px",
                      marginTop: "2px",
                    }}
                  >
                    {route.stops.length} תחנות | {route.totalDistance} ק"מ |{" "}
                    {route.schedule?.startTime}–{route.schedule?.endTime}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {/* ✅ משימה 4.1 – ETA badge עם צבע דינמי */}
                  {loc && (
                    <EtaBadge minutes={loc.etaToNext} />
                  )}

                  <span
                    className={`badge status-${route.status}`}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {route.status === "active"
                      ? "פעיל"
                      : route.status === "delayed"
                      ? "עיכוב"
                      : "הושלם"}
                  </span>

                  {/* כפתור איפוס עיכוב */}
                  {isDelayed && (
                    <button
                      className="btn btn-sm"
                      style={{
                        background: "rgba(46,204,113,0.2)",
                        border: "1px solid rgba(46,204,113,0.4)",
                        color: "#4eff91",
                        padding: "5px 8px",
                      }}
                      title="אפס ל-פעיל"
                      onClick={() => resetRouteStatus(route)}
                    >
                      <RefreshCw size={13} />
                    </button>
                  )}

                  <button
                    className="btn btn-sm btn-outline"
                    style={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.1)",
                    }}
                    onClick={() => setModal({ mode: "edit", route })}
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteConfirm(route)}
                    style={{ padding: "6px" }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "6px 8px",
                      cursor: "pointer",
                      color: "white",
                    }}
                    onClick={() =>
                      setExpanded(isExpanded ? null : route.id)
                    }
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Summary row */}
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  gap: "24px",
                  borderBottom: isExpanded
                    ? "1px solid var(--gray-200)"
                    : "none",
                  background: "white",
                }}
              >
                {[
                  {
                    icon: Users,
                    label: "נהג",
                    value: driver?.name || "לא מוקצה",
                  },
                  {
                    icon: Users,
                    label: "תלמידים",
                    value: `${totalStudents} תלמידים`,
                  },
                  {
                    icon: Clock,
                    label: "ימים",
                    value:
                      route.schedule?.days?.join(", ") || "כל הימים",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <item.icon size={14} color="var(--gray-400)" />
                    <span style={{ color: "var(--gray-500)" }}>
                      {item.label}:
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--gray-800)",
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Expanded stops */}
              {isExpanded && (
                <div style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--gray-600)",
                      marginBottom: "12px",
                    }}
                  >
                    תחנות המסלול:
                  </div>
                  {route.stops.map((stop, i) => {
                    const isNext =
                      loc && i === (loc.nextStopIndex || 0);
                    const isDone =
                      loc && i < (loc.nextStopIndex || 0);

                    return (
                      <div key={stop.stopId} className="stop-item">
                        <div
                          className={`stop-bullet ${
                            isNext
                              ? "active"
                              : isDone
                              ? "completed"
                              : ""
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                            }}
                          >
                            {stop.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--gray-500)",
                            }}
                          >
                            {stop.address}
                          </div>
                        </div>
                        <div
                          style={{ textAlign: "left", fontSize: "12px" }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--navy)",
                            }}
                          >
                            {stop.estimatedTime}
                          </div>
                          {stop.studentsCount > 0 && (
                            <div
                              style={{
                                color:
                                  stop.studentsCount > 20
                                    ? "var(--red)"
                                    : "var(--gray-500)",
                              }}
                            >
                              {stop.studentsCount} תלמידים
                            </div>
                          )}
                        </div>
                        {/* ETA לתחנה הבאה */}
                        {isNext && loc && (
                          <EtaBadge minutes={loc.etaToNext} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

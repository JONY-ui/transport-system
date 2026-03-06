// ======================================================
// DriversPage.js
// ======================================================
// תיקונים:
//   ✅ משימה 4.2: UserCheck/UserX מחוברים ל-toggleDriverStatus
//                  שמעדכן Firestore ב-real-time
//   ✅ משימה 5.1: Skeleton loading בזמן טעינה ראשונית
//   ✅ ולידציה מלאה של הטופס
// ======================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Plus, Search, Edit2, Trash2, X,
  Phone, Bus, UserCheck, UserX,
} from "lucide-react";

// ────────────────────────────────────────────────────────
// Skeleton Row – מוצג בזמן טעינה ראשונית (משימה 5.1)
// ────────────────────────────────────────────────────────
function SkeletonRow() {
  const pulse = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: "6px",
    height: "14px",
  };
  return (
    <tr>
      {[120, 100, 90, 100, 70, 70, 80].map((w, i) => (
        <td key={i}>
          <div style={{ ...pulse, width: `${w}px` }} />
        </td>
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </tr>
  );
}

// ────────────────────────────────────────────────────────
// Driver Modal
// ────────────────────────────────────────────────────────
function DriverModal({ driver, onClose, onSave }) {
  const [form, setForm] = useState(
    driver || { name: "", phone: "", vehicleNumber: "" }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "שם חובה";
    if (!/^05\d{8}$/.test(form.phone))
      e.phone = "מספר טלפון לא תקין (05XXXXXXXX)";
    if (!form.vehicleNumber.trim()) e.vehicleNumber = "מספר רכב חובה";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  const fields = [
    { key: "name", label: "שם מלא", placeholder: "משה כהן", type: "text" },
    {
      key: "phone",
      label: "מספר טלפון",
      placeholder: "0501234567",
      type: "tel",
      icon: Phone,
    },
    {
      key: "vehicleNumber",
      label: "מספר רכב / שם",
      placeholder: "אוטובוס 15",
      type: "text",
      icon: Bus,
    },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {driver ? "עריכת נהג" : "הוספת נהג חדש"}
          </div>
          <button className="btn btn-icon btn-outline" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label className="form-label">{field.label}</label>
              <div style={{ position: "relative" }}>
                {field.icon && (
                  <field.icon
                    size={15}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--gray-400)",
                    }}
                  />
                )}
                <input
                  className="form-input"
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  style={{
                    paddingRight: field.icon ? "38px" : undefined,
                    borderColor: errors[field.key]
                      ? "var(--red)"
                      : undefined,
                  }}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field.key]: e.target.value }))
                  }
                />
              </div>
              {errors[field.key] && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--red)",
                    marginTop: "4px",
                  }}
                >
                  {errors[field.key]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSubmit}>
            {driver ? "שמור שינויים" : "הוסף נהג"}
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
export default function DriversPage() {
  const {
    drivers,
    routes,
    addDriver,
    updateDriver,
    deleteDriver,
    toggleDriverStatus, // ✅ משימה 4.2 – מחובר מ-AppContext
    addNotification,
    initialLoading,
  } = useApp();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = drivers.filter((d) => {
    const matchSearch =
      d.name.includes(search) || d.phone.includes(search);
    const matchStatus =
      statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (form) => {
    if (modal.mode === "edit") {
      updateDriver(modal.driver.id, form);
    } else {
      addDriver(form);
    }
    setModal(null);
  };

  const handleDelete = (driver) => {
    deleteDriver(driver.id);
    setDeleteConfirm(null);
  };

  const statusCounts = {
    all: drivers.length,
    driving: drivers.filter((d) => d.status === "driving").length,
    online: drivers.filter((d) => d.status === "online").length,
    offline: drivers.filter((d) => d.status === "offline").length,
  };

  const statusLabels = {
    driving: "נוהג",
    online: "מחובר",
    offline: "לא מחובר",
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 60000;
    if (diff < 1) return "זה עתה";
    if (diff < 60) return `לפני ${Math.floor(diff)} דק'`;
    return `לפני ${Math.floor(diff / 60)} שע'`;
  };

  return (
    <div className="page-container">
      {/* ── Edit / Add Modal ── */}
      {modal && (
        <DriverModal
          driver={modal.driver}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Delete Confirm ── */}
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
                <Trash2
                  size={18}
                  style={{ display: "inline", marginLeft: "8px" }}
                />
                מחיקת נהג
              </div>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--gray-600)" }}>
                האם למחוק את הנהג{" "}
                <strong>{deleteConfirm.name}</strong>? פעולה זו
                אינה הפיכה.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                כן, מחק
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
            ניהול נהגים
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--gray-500)",
              marginTop: "4px",
            }}
          >
            {drivers.length} נהגים רשומים במערכת
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ mode: "add", driver: null })}
        >
          <Plus size={18} />
          רשום נהג חדש
        </button>
      </div>

      {/* ── Filters ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          className="search-input-wrapper"
          style={{ flex: 1, minWidth: "200px" }}
        >
          <Search size={16} className="search-icon" />
          <input
            className="form-input"
            placeholder="חפש לפי שם או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { key: "all", label: "הכל" },
            { key: "driving", label: "נוהג" },
            { key: "online", label: "מחובר" },
            { key: "offline", label: "לא מחובר" },
          ].map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${
                statusFilter === f.key ? "btn-secondary" : "btn-outline"
              }`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
              <span
                style={{
                  background:
                    statusFilter === f.key
                      ? "rgba(255,255,255,0.2)"
                      : "var(--gray-200)",
                  borderRadius: "10px",
                  padding: "0 6px",
                  fontSize: "11px",
                  marginRight: "4px",
                }}
              >
                {statusCounts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>נהג</th>
                <th>טלפון</th>
                <th>רכב</th>
                <th>מסלול נוכחי</th>
                <th>סטטוס</th>
                <th>כניסה אחרונה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {/* Skeleton בזמן טעינה (משימה 5.1) */}
              {initialLoading &&
                [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

              {!initialLoading &&
                filtered.map((driver) => {
                  const route = routes.find(
                    (r) => r.id === driver.currentRouteId
                  );
                  const isOffline = driver.status === "offline";

                  return (
                    <tr key={driver.id}>
                      {/* Avatar + Name */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div className="driver-avatar">
                            {driver.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {driver.name}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--gray-400)",
                              }}
                            >
                              ID: {driver.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        <a
                          href={`tel:${driver.phone}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "var(--navy-light)",
                            fontWeight: 500,
                            fontSize: "13px",
                          }}
                        >
                          <Phone size={13} />
                          {driver.phone}
                        </a>
                      </td>

                      {/* Vehicle */}
                      <td
                        style={{
                          fontSize: "13px",
                          color: "var(--gray-600)",
                        }}
                      >
                        {driver.vehicleNumber || "–"}
                      </td>

                      {/* Route */}
                      <td>
                        {route ? (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "var(--navy)",
                              fontWeight: 500,
                            }}
                          >
                            {route.name}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "var(--gray-400)",
                              fontSize: "13px",
                            }}
                          >
                            אין מסלול
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td>
                        <span className={`badge ${driver.status}`}>
                          <span className="badge-dot" />
                          {statusLabels[driver.status]}
                        </span>
                      </td>

                      {/* Last login */}
                      <td
                        style={{
                          fontSize: "12px",
                          color: "var(--gray-500)",
                        }}
                      >
                        {timeAgo(driver.lastLogin)}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {/* ✅ משימה 4.2 – כפתור הפעלה/השהיה מחובר */}
                          <button
                            className="btn btn-sm btn-outline"
                            title={
                              isOffline ? "הפעל נהג" : "השהה נהג"
                            }
                            onClick={() => toggleDriverStatus(driver)}
                            style={{ padding: "6px" }}
                          >
                            {isOffline ? (
                              <UserCheck
                                size={14}
                                color="var(--green-dark)"
                              />
                            ) : (
                              <UserX
                                size={14}
                                color="var(--orange)"
                              />
                            )}
                          </button>

                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() =>
                              setModal({ mode: "edit", driver })
                            }
                            style={{ padding: "6px" }}
                            title="עריכה"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setDeleteConfirm(driver)}
                            style={{ padding: "6px" }}
                            title="מחיקה"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {!initialLoading && filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "var(--gray-400)",
              }}
            >
              <Bus
                size={40}
                style={{ margin: "0 auto 12px", opacity: 0.3 }}
              />
              <div>לא נמצאו נהגים</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

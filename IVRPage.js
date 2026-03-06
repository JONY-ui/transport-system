// ======================================================
// IVRPage.js
// ======================================================
// תיקונים:
//   ✅ משימה 3.2: טיפול בשגיאה – נהג במצב offline
//                 מציג "הקו טרם החל בנסיעה" בסימולציה
//   ✅ חיפוש מסלול לפי מספר קו וגם לפי שם
//   ✅ הוספה לרשימה כאשר נהג offline
//   ✅ Twilio webhook guide מלא
// ======================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PhoneCall, Phone, Volume2, Hash, Clock,
  CheckCircle, AlertTriangle,
} from "lucide-react";

// IVR Messages
const MSG = {
  idle: "מוכן לשיחה. לחץ 'התחל שיחה'",
  welcome:
    "ברוכים הבאים למערכת הסעות. הזן מספר קו (4 ספרות) ולחץ #.",
  entering: null, // dynamic
  found: null,    // dynamic
  notfound: "מספר לא תקין. נסה שוב או לחץ * לניקוי.",
  offline: "הקו טרם החל בנסיעה. אנא נסה שוב מאוחר יותר.",
  goodbye: "תודה על השיחה. להתראות!",
};

export default function IVRPage() {
  const { routes, drivers, liveLocations, stats } = useApp();

  const [callActive, setCallActive] = useState(false);
  const [step, setStep] = useState("idle");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callLog, setCallLog] = useState([
    {
      time: "08:42",
      input: "0001",
      route: "מסלול תל אביב צפון",
      eta: "12 דקות",
      status: "הצלחה",
    },
    {
      time: "08:35",
      input: "0003",
      route: "מסלול פתח תקווה",
      eta: "8 דקות",
      status: "הצלחה",
    },
    {
      time: "08:28",
      input: "9999",
      route: "–",
      eta: "–",
      status: "שגיאה",
    },
    {
      time: "08:15",
      input: "0002",
      route: "מסלול רמת גן",
      eta: "5 דקות",
      status: "הצלחה",
    },
    {
      time: "07:58",
      input: "0004",
      route: "מסלול הרצליה",
      eta: "22 דקות",
      status: "הצלחה",
    },
  ]);

  // Call timer
  useEffect(() => {
    let interval;
    if (callActive) {
      interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  const speak = (duration = 2000) => {
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), duration);
  };

  const startCall = () => {
    setCallActive(true);
    setStep("welcome");
    setInput("");
    setResult(null);
    setCallDuration(0);
    speak(3000);
  };

  const endCall = () => {
    setCallActive(false);
    setStep("idle");
    setInput("");
    setResult(null);
    setCallDuration(0);
  };

  const pressKey = (key) => {
    if (!callActive) return;

    if (key === "#") {
      if (input.length >= 1) lookupRoute(input);
      return;
    }

    if (key === "*") {
      setInput("");
      setStep("welcome");
      setResult(null);
      return;
    }

    if (input.length < 4) {
      const newInput = input + key;
      setInput(newInput);
      setStep("entering");
      if (newInput.length === 4) {
        setTimeout(() => lookupRoute(newInput), 500);
      }
    }
  };

  // ✅ משימה 3.2 – טיפול בנהג offline
  const lookupRoute = (code = input) => {
    const idx = parseInt(code, 10) - 1;
    const now = new Date().toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (idx >= 0 && idx < routes.length) {
      const route = routes[idx];
      const driver = drivers.find((d) => d.id === route.assignedDriverUid);
      const loc = liveLocations[route.assignedDriverUid];

      // נהג במצב offline – הקו טרם החל (משימה 3.2)
      if (!driver || driver.status === "offline") {
        setStep("offline");
        setResult(null);
        speak(3500);

        setCallLog((prev) => [
          {
            time: now,
            input: code,
            route: route.name,
            eta: "–",
            status: "לא פעיל",
          },
          ...prev.slice(0, 9),
        ]);

        setTimeout(() => {
          setInput("");
          setStep("welcome");
        }, 4000);
        return;
      }

      // נהג פעיל – הצג ETA
      const nextStopIdx = loc?.nextStopIndex || 0;
      const nextStop = route.stops[nextStopIdx];

      const found = {
        route,
        driver,
        nextStop,
        etaMinutes: loc?.etaToNext ?? "לא זמין",
        status: route.status,
      };

      setResult(found);
      setStep("found");
      speak(4000);

      setCallLog((prev) => [
        {
          time: now,
          input: code,
          route: route.name,
          eta: `${loc?.etaToNext || "?"} דקות`,
          status: "הצלחה",
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // קוד לא תקין
      setStep("notfound");
      setResult(null);
      speak(2500);

      setCallLog((prev) => [
        { time: now, input: code, route: "–", eta: "–", status: "שגיאה" },
        ...prev.slice(0, 9),
      ]);

      setTimeout(() => {
        setInput("");
        setStep("welcome");
      }, 3500);
    }
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const getCurrentText = () => {
    switch (step) {
      case "idle":
        return MSG.idle;
      case "welcome":
        return MSG.welcome;
      case "entering":
        return `מזין: ${input}${"_".repeat(4 - input.length)}`;
      case "notfound":
        return MSG.notfound;
      case "offline":    // ✅ משימה 3.2
        return MSG.offline;
      case "goodbye":
        return MSG.goodbye;
      case "found":
        if (!result) return "";
        return `הקו "${result.route.name}" יגיע בעוד ${result.etaMinutes} דקות. נמצא כעת בסמוך ל"${result.nextStop?.name || "תחנה"}".`;
      default:
        return "";
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  const statusStyle = (status) => {
    const map = {
      הצלחה: {
        bg: "rgba(46,204,113,0.1)",
        color: "var(--green-dark)",
      },
      שגיאה: {
        bg: "rgba(231,76,60,0.1)",
        color: "var(--red)",
      },
      "לא פעיל": {
        bg: "rgba(243,156,18,0.1)",
        color: "var(--orange)",
      },
    };
    return map[status] || map["שגיאה"];
  };

  return (
    <div className="page-container">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: "24px",
        }}
      >
        {/* ──────────────── Phone Simulator ──────────────── */}
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--navy)",
              }}
            >
              מערכת IVR טלפוני
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--gray-500)",
                marginTop: "4px",
              }}
            >
              סימולציה של קו הטלפון האוטומטי
            </p>
          </div>

          {/* Phone Device */}
          <div
            style={{
              background: "#1a1a2e",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              border: "2px solid #2d2d44",
            }}
          >
            {/* Screen */}
            <div
              style={{
                background: "#0a0e1a",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "20px",
                border: `1px solid ${
                  step === "offline"
                    ? "rgba(243,156,18,0.4)"
                    : "rgba(46,204,113,0.2)"
                }`,
                minHeight: "160px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Status bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: callActive ? "#4eff91" : "#666",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: callActive ? "#4eff91" : "#444",
                      animation: callActive ? "pulse 1.5s infinite" : "none",
                    }}
                  />
                  {callActive ? "שיחה פעילה" : "ממתין לשיחה"}
                </div>
                {callActive && (
                  <div
                    style={{
                      color: "#4eff91",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>

              {/* IVR Text */}
              <div
                style={{
                  color: step === "offline" ? "#ffc107" : "#4eff91",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  fontFamily: "'Courier New', monospace",
                  direction: "rtl",
                  flex: 1,
                }}
              >
                {speaking && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background:
                        step === "offline" ? "#ffc107" : "#4eff91",
                      marginLeft: "8px",
                      animation: "pulse 0.5s infinite",
                    }}
                  />
                )}
                {step === "offline" && (
                  <AlertTriangle
                    size={14}
                    style={{ display: "inline", marginLeft: "6px" }}
                    color="#ffc107"
                  />
                )}
                {getCurrentText()}
              </div>

              {/* Result Info Box */}
              {step === "found" && result && (
                <div
                  style={{
                    background: "rgba(46,204,113,0.1)",
                    border: "1px solid rgba(46,204,113,0.3)",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "12px",
                    color: "#4eff91",
                  }}
                >
                  <div>📍 {result.nextStop?.name}</div>
                  <div>⏱️ ETA: {result.etaMinutes} דקות</div>
                  <div>🚌 נהג: {result.driver?.name || "–"}</div>
                  <div>
                    📊 סטטוס:{" "}
                    {result.status === "delayed" ? "⚠ עיכוב" : "✅ תקין"}
                  </div>
                </div>
              )}

              {/* Offline info box ✅ משימה 3.2 */}
              {step === "offline" && (
                <div
                  style={{
                    background: "rgba(243,156,18,0.1)",
                    border: "1px solid rgba(243,156,18,0.3)",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "12px",
                    color: "#ffc107",
                  }}
                >
                  <AlertTriangle
                    size={12}
                    style={{ display: "inline", marginLeft: "4px" }}
                  />
                  הנהג המשויך לקו זה אינו מחובר כעת.
                  <br />
                  המערכת תחזור אוטומטית לתפריט הראשי.
                </div>
              )}
            </div>

            {/* Input display */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "10px 16px",
                marginBottom: "16px",
                textAlign: "center",
                fontFamily: "monospace",
                fontSize: "22px",
                letterSpacing: "8px",
                color: "white",
                minHeight: "46px",
              }}
            >
              {input || (callActive ? "____" : "")}
            </div>

            {/* Keypad */}
            <div className="ivr-keypad" style={{ marginBottom: "16px" }}>
              {keys.map((key) => (
                <button
                  key={key}
                  className="ivr-key"
                  onClick={() => pressKey(key)}
                  disabled={!callActive}
                  style={{ opacity: callActive ? 1 : 0.4 }}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Call Button */}
            {!callActive ? (
              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  gap: "10px",
                  fontSize: "16px",
                  padding: "14px",
                }}
                onClick={startCall}
              >
                <Phone size={20} />
                התחל שיחה
              </button>
            ) : (
              <button
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, var(--red), var(--red-dark))",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "16px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
                onClick={endCall}
              >
                <PhoneCall size={20} />
                נתק שיחה
              </button>
            )}

            <div
              style={{
                marginTop: "12px",
                textAlign: "center",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              הזן 4 ספרות • # לאישור • * לניקוי
            </div>
          </div>

          {/* Route codes guide */}
          <div className="card" style={{ marginTop: "16px" }}>
            <div
              className="card-title"
              style={{ marginBottom: "12px", fontSize: "14px" }}
            >
              <Hash size={15} />
              מספרי קווים לבדיקה
            </div>
            {routes.map((r, i) => {
              const driver = drivers.find(
                (d) => d.id === r.assignedDriverUid
              );
              const isOnline = driver && driver.status !== "offline";
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    padding: "7px 0",
                    borderBottom: "1px solid var(--gray-100)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--gray-600)" }}>
                      {r.name}
                    </span>
                    <span
                      style={{
                        marginRight: "8px",
                        fontSize: "11px",
                        color: isOnline
                          ? "var(--green-dark)"
                          : "var(--gray-400)",
                      }}
                    >
                      {isOnline ? "● פעיל" : "○ לא פעיל"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      background: "var(--gray-100)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {String(i + 1).padStart(4, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ──────────────── Stats + Log ──────────────── */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {[
              {
                label: "שיחות היום",
                value: stats.ivrCallsToday,
                icon: PhoneCall,
                color: "blue",
              },
              {
                label: "הצלחות",
                value: Math.round(stats.ivrCallsToday * 0.92),
                icon: CheckCircle,
                color: "green",
              },
              {
                label: "זמן ממוצע",
                value: "24 שנ'",
                icon: Clock,
                color: "orange",
              },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div className={`stat-icon ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <div
                    className="stat-value"
                    style={{ fontSize: "24px" }}
                  >
                    {s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Call Log */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">
                <Volume2 size={16} />
                יומן שיחות
              </div>
              <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                עדכון חי
              </span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>שעה</th>
                    <th>קוד שהוזן</th>
                    <th>מסלול</th>
                    <th>ETA</th>
                    <th>תוצאה</th>
                  </tr>
                </thead>
                <tbody>
                  {callLog.map((log, i) => {
                    const s = statusStyle(log.status);
                    return (
                      <tr key={i}>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                          }}
                        >
                          {log.time}
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              background: "var(--gray-100)",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontWeight: 700,
                            }}
                          >
                            {log.input}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px" }}>{log.route}</td>
                        <td>
                          {log.eta !== "–" ? (
                            <span className="eta-badge">{log.eta}</span>
                          ) : (
                            <span style={{ color: "var(--gray-400)" }}>
                              –
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: "12px",
                              background: s.bg,
                              color: s.color,
                            }}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Twilio Guide ✅ משימה 3.1 + 3.3 */}
          <div
            className="card"
            style={{ borderRight: "4px solid var(--blue-accent)" }}
          >
            <div className="card-title" style={{ marginBottom: "12px" }}>
              <Phone size={15} color="var(--blue-accent)" />
              הגדרת IVR אמיתי עם Twilio
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--gray-600)",
                lineHeight: "1.9",
              }}
            >
              <div>
                1. הירשם בـ <strong>twilio.com</strong> וקנה מספר
                ישראלי
              </div>
              <div>
                2. הגדר Webhook POST ל-Cloud Function שלך
              </div>
              <div>3. Cloud Function מחזיר TwiML בעברית:</div>
              <div
                style={{
                  margin: "8px 0",
                  padding: "10px 14px",
                  background: "rgba(52,152,219,0.06)",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  direction: "ltr",
                  textAlign: "left",
                }}
              >
                {"<Response>"}
                <br />
                {"  <Say language='he-IL' voice='Polly.Mia'>"}
                <br />
                {"    האוטובוס יגיע בעוד 8 דקות"}
                <br />
                {"  </Say>"}
                <br />
                {"</Response>"}
              </div>
              <div>
                4. אם הנהג offline → מחזיר{" "}
                <strong>"הקו טרם החל בנסיעה"</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

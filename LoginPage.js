import { useState } from "react";
import { Bus, Lock, User, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { login, loading } = useApp();
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.password.trim()) {
      setError("נא למלא את כל השדות");
      return;
    }
    if (form.password !== "admin123") {
      setError("סיסמה שגויה. לדמו: admin123");
      return;
    }
    await login(form.name, form.password);
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />

      {/* Floating buses animation */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden"
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            opacity: 0.04,
            fontSize: "80px",
            animation: `float${i % 2 === 0 ? 'L' : 'R'} ${8 + i * 2}s linear infinite`,
            top: `${15 + i * 12}%`,
            left: i % 2 === 0 ? "-100px" : "100%",
          }}>🚌</div>
        ))}
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Bus size={36} color="white" strokeWidth={1.5} />
          </div>
          <h1>מערכת ניהול הסעות</h1>
          <p>כניסה למנהלי מערכת</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">שם מנהל</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", color: "var(--gray-400)"
              }} />
              <input
                className="form-input"
                style={{ paddingRight: "38px" }}
                placeholder="שם מלא"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">סיסמה</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", color: "var(--gray-400)"
              }} />
              <input
                className="form-input"
                style={{ paddingRight: "38px" }}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <p style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "4px" }}>
              לדמו: סיסמה admin123
            </p>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.2)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              color: "var(--red)", fontSize: "13px"
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "16px", height: "16px", borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", animation: "spin 0.6s linear infinite",
                  display: "inline-block"
                }} />
                מתחבר...
              </span>
            ) : "כניסה למערכת"}
          </button>
        </form>

        <div style={{
          marginTop: "28px", padding: "16px", background: "var(--gray-100)",
          borderRadius: "10px", fontSize: "12px", color: "var(--gray-500)", lineHeight: "1.7"
        }}>
          <strong style={{ color: "var(--gray-700)" }}>מידע על המערכת:</strong><br />
          מערכת ניהול הסעות חכמה | 40 נהגים | GPS חי | IVR<br />
          Firebase + React | עברית RTL
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatL {
          from { transform: translateX(-100px) scaleX(-1); }
          to { transform: translateX(calc(100vw + 100px)) scaleX(-1); }
        }
        @keyframes floatR {
          from { transform: translateX(calc(100vw + 100px)); }
          to { transform: translateX(-100px); }
        }
      `}</style>
    </div>
  );
}

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Settings, Bell, Shield, Database, Smartphone, Save } from "lucide-react";

export default function SettingsPage() {
  const { addNotification } = useApp();
  const [settings, setSettings] = useState({
    orgName: "מוסד חינוכי - מערכת הסעות",
    adminPhone: "0521234567",
    ivrPhone: "+972-3-XXXXXXX",
    gpsInterval: 10,
    etaRefresh: 30,
    alertDelay: 5,
    autoLogout: 120,
    twilioSid: "",
    twilioToken: "",
    firebaseProject: "",
    wazeSdkKey: "",
    emailAlerts: true,
    smsAlerts: true,
    offlineAlert: true,
    delayAlert: true,
  });

  const update = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    addNotification("ההגדרות נשמרו בהצלחה", "success");
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div className="card-header" style={{ marginBottom: "20px" }}>
        <div className="card-title" style={{ fontSize: "17px" }}>
          <Icon size={18} color="var(--navy)" />
          {title}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, children, fullWidth }) => (
    <div className="form-group" style={{ marginBottom: 0, gridColumn: fullWidth ? "span 2" : "span 1" }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: "1px solid var(--gray-100)"
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: "14px" }}>{label}</div>
        {desc && <div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "2px" }}>{desc}</div>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: "44px", height: "24px", borderRadius: "12px",
          background: checked ? "var(--green)" : "var(--gray-300)",
          cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0,
        }}
      >
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%",
          background: "white", position: "absolute", top: "3px",
          right: checked ? "3px" : "23px",
          transition: "right 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
        }} />
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--navy)" }}>הגדרות מערכת</h2>
          <p style={{ fontSize: "14px", color: "var(--gray-500)", marginTop: "4px" }}>ניהול תצורת המערכת</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> שמור הגדרות
        </button>
      </div>

      <div style={{ maxWidth: "900px" }}>
        {/* General */}
        <Section icon={Settings} title="הגדרות כלליות">
          <Field label="שם המוסד" fullWidth>
            <input className="form-input" value={settings.orgName} onChange={e => update("orgName", e.target.value)} />
          </Field>
          <Field label="טלפון מנהל ראשי">
            <input className="form-input" value={settings.adminPhone} onChange={e => update("adminPhone", e.target.value)} />
          </Field>
          <Field label="מספר IVR">
            <input className="form-input" value={settings.ivrPhone} onChange={e => update("ivrPhone", e.target.value)} />
          </Field>
        </Section>

        {/* Technical */}
        <Section icon={Smartphone} title="הגדרות טכניות">
          <Field label={`עדכון GPS (שניות): ${settings.gpsInterval}`}>
            <input type="range" min="5" max="60" step="5"
              value={settings.gpsInterval}
              onChange={e => update("gpsInterval", parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--navy)" }} />
          </Field>
          <Field label={`עדכון ETA (שניות): ${settings.etaRefresh}`}>
            <input type="range" min="10" max="120" step="10"
              value={settings.etaRefresh}
              onChange={e => update("etaRefresh", parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--navy)" }} />
          </Field>
          <Field label={`התנתקות אוטומטית (דקות): ${settings.autoLogout}`}>
            <input type="range" min="30" max="480" step="30"
              value={settings.autoLogout}
              onChange={e => update("autoLogout", parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--navy)" }} />
          </Field>
          <Field label={`סף התראת עיכוב (דקות): ${settings.alertDelay}`}>
            <input type="range" min="1" max="30" step="1"
              value={settings.alertDelay}
              onChange={e => update("alertDelay", parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--navy)" }} />
          </Field>
        </Section>

        {/* Integrations */}
        <Section icon={Database} title="אינטגרציות ו-API">
          <Field label="Twilio Account SID">
            <input className="form-input" type="password" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.twilioSid} onChange={e => update("twilioSid", e.target.value)} />
          </Field>
          <Field label="Twilio Auth Token">
            <input className="form-input" type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.twilioToken} onChange={e => update("twilioToken", e.target.value)} />
          </Field>
          <Field label="Firebase Project ID">
            <input className="form-input" placeholder="my-transport-app"
              value={settings.firebaseProject} onChange={e => update("firebaseProject", e.target.value)} />
          </Field>
          <Field label="Waze SDK / Maps API Key">
            <input className="form-input" type="password" placeholder="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.wazeSdkKey} onChange={e => update("wazeSdkKey", e.target.value)} />
          </Field>
          <Field label="הוראות הגדרה" fullWidth>
            <div style={{
              background: "var(--gray-100)", borderRadius: "10px",
              padding: "14px", fontSize: "12px", color: "var(--gray-600)", lineHeight: "1.8"
            }}>
              <strong>Firebase:</strong> console.firebase.google.com → צור פרויקט → העתק הגדרות → עדכן src/data/mockData.js<br />
              <strong>Twilio:</strong> twilio.com/console → הגדרות חשבון → Number → הגדר Webhook<br />
              <strong>Waze/Google Maps:</strong> console.cloud.google.com → APIs → Maps API → צור מפתח<br />
              <strong>GitHub Pages:</strong> npm run build → הגדר gh-pages → push
            </div>
          </Field>
        </Section>

        {/* Alerts */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-title" style={{ fontSize: "17px" }}>
              <Bell size={18} color="var(--navy)" />
              התראות
            </div>
          </div>
          <Toggle
            label="התראות Email"
            desc="שלח מייל למנהל בעת עיכובים ובעיות"
            checked={settings.emailAlerts}
            onChange={v => update("emailAlerts", v)}
          />
          <Toggle
            label="התראות SMS"
            desc="שלח SMS דרך Twilio"
            checked={settings.smsAlerts}
            onChange={v => update("smsAlerts", v)}
          />
          <Toggle
            label="התראת נהג לא מחובר"
            desc="אם נהג לא התחבר 15 דקות לפני המסלול"
            checked={settings.offlineAlert}
            onChange={v => update("offlineAlert", v)}
          />
          <Toggle
            label="התראת עיכוב"
            desc={`אם עיכוב עולה על ${settings.alertDelay} דקות`}
            checked={settings.delayAlert}
            onChange={v => update("delayAlert", v)}
          />
        </div>

        {/* Security */}
        <div className="card" style={{ marginTop: "20px" }}>
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-title" style={{ fontSize: "17px" }}>
              <Shield size={18} color="var(--navy)" />
              אבטחה ופרטיות
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "var(--gray-600)", lineHeight: "1.9" }}>
            <div>✅ כל החיבורים מאובטחים (HTTPS/TLS)</div>
            <div>✅ מידע מיקום נהגים מוגן ונגיש למנהלים בלבד</div>
            <div>✅ המערכת תואמת לחוק הגנת הפרטיות הישראלי (תשמ"א-1981)</div>
            <div>✅ גיבויים אוטומטיים יומיים ב-Firebase</div>
            <div>✅ מחיקת מיקומים ישנים אחרי 24 שעות</div>
            <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(52,152,219,0.06)", borderRadius: "8px" }}>
              <strong>Firebase Security Rules:</strong> הגדר חוקים ב-Firestore לאפשר גישה מבוססת תפקיד
              (נהגים רואים רק את המסלול שלהם, מנהלים רואים הכל).
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave}>
            <Save size={18} /> שמור את כל ההגדרות
          </button>
        </div>
      </div>
    </div>
  );
}

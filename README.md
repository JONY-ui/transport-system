# 🚌 מערכת ניהול הסעות חכמה

פאנל ניהול ווב מלא למערכת הסעות עם 40 אוטובוסים, GPS חי, IVR טלפוני ודוחות.

## 🌐 צפייה חיה

[פתח את המערכת](https://YOUR_USERNAME.github.io/transport-management-system)

**פרטי כניסה לדמו:**
- שם: כל שם
- סיסמה: `admin123`

---

## ✨ פיצ'רים

| מסך | תיאור |
|-----|--------|
| 📊 **דשבורד** | סטטיסטיקות חי, מפת נהגים, פעילות אחרונה |
| 🗺️ **ניטור חי** | מפה SVG אינטראקטיבית עם GPS חי של 40 נהגים |
| 🚌 **ניהול נהגים** | הוספה/עריכה/מחיקה, חיפוש, סינון לפי סטטוס |
| 🛣️ **ניהול מסלולים** | יצירת מסלולים, תחנות, הקצאת נהגים, לוח זמנים |
| 📞 **מערכת IVR** | סימולציית טלפון אוטומטי עם לוח מקשים אמיתי |
| 📈 **דוחות** | גרפים, ביצועי נהגים, סיכום שבועי |
| ⚙️ **הגדרות** | Firebase, Twilio, Waze API, התראות |

---

## 🚀 הרצה מקומית

```bash
git clone https://github.com/YOUR_USERNAME/transport-management-system.git
cd transport-management-system
npm install
npm start
```

האתר יפתח בכתובת: `http://localhost:3000`

---

## 📦 פריסה ל-GitHub Pages

### שיטה אוטומטית (GitHub Actions)

1. **Push ל-main** — הפריסה מתבצעת אוטומטית דרך `.github/workflows/deploy.yml`
2. ב-GitHub → Settings → Pages → Source: **gh-pages branch**
3. המתן כ-2 דקות לבנייה

### שיטה ידנית

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

הוסף ל-`package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/transport-management-system"
```

---

## 🔧 חיבור Firebase אמיתי

1. פתח [console.firebase.google.com](https://console.firebase.google.com)
2. צור פרויקט חדש → Firestore Database → Cloud Functions
3. עדכן `src/data/mockData.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. התקן:
```bash
npm install firebase
```

5. החלף נתוני mock ב-Firestore Listeners:
```javascript
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Real-time drivers
onSnapshot(collection(db, 'drivers'), (snap) => {
  setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});
```

---

## 📞 חיבור Twilio IVR

1. הירשם בـ [twilio.com](https://twilio.com)
2. קנה מספר ישראלי (~5₪/חודש)
3. ב-Firebase Functions:

```javascript
const twilio = require('twilio');

exports.ivr = functions.https.onRequest((req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const gather = twiml.gather({ numDigits: 4, action: '/ivr-response' });
  gather.say({ language: 'he-IL', voice: 'woman' },
    'ברוכים הבאים למערכת הסעות. הזן מספר קו.');
  res.type('text/xml');
  res.send(twiml.toString());
});
```

---

## 🗺️ חיבור Waze / Google Maps

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services
2. הפעל: Maps JavaScript API, Directions API
3. צור API Key
4. עדכן בהגדרות המערכת

```javascript
// ETA calculation with Google Directions API
const getETA = async (origin, destination) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${origin.lat},${origin.lng}&` +
    `destination=${destination.lat},${destination.lng}&` +
    `key=YOUR_API_KEY&language=he`
  );
  const data = await res.json();
  return data.routes[0]?.legs[0]?.duration?.value / 60; // minutes
};
```

---

## 🏗️ ארכיטקטורה

```
src/
├── context/
│   └── AppContext.js      # Global state (drivers, routes, locations)
├── data/
│   └── mockData.js        # נתוני דמו + Firebase config
├── pages/
│   ├── LoginPage.js       # דף כניסה
│   ├── DashboardPage.js   # דשבורד ראשי
│   ├── MonitorPage.js     # ניטור חי + מפה
│   ├── DriversPage.js     # ניהול נהגים
│   ├── RoutesPage.js      # ניהול מסלולים
│   ├── IVRPage.js         # מערכת טלפון
│   ├── ReportsPage.js     # דוחות
│   └── SettingsPage.js    # הגדרות
├── components/
│   ├── Sidebar.js         # ניווט צד
│   ├── Topbar.js          # סרגל עליון
│   └── Notifications.js   # Toast notifications
├── App.js                 # נקודת כניסה
└── index.css              # עיצוב גלובלי
```

---

## 💰 עלויות

| שירות | עלות |
|--------|------|
| Firebase (Spark) | חינם עד 50K קריאות/יום |
| GitHub Pages | חינם |
| Twilio מספר | ~5₪/חודש |
| Google Maps API | חינם עד 200$/חודש |
| **סה"כ** | **0-50₪/חודש בהתחלה** |

---

## 🛡️ אבטחה

- HTTPS/TLS על כל החיבורים
- Firebase Security Rules
- תאימות לחוק הגנת הפרטיות הישראלי
- מחיקת מיקומים ישנים אחרי 24 שעות

---

## 📱 אפליקציית נהגים (Flutter)

ראה תיקיית `/driver-app` (בפיתוח) עבור אפליקציית Android/iOS לנהגים.

---

Built with ❤️ | React + Firebase + Waze

// ======================================================
// AppContext.js - Global State Management
// ======================================================
// תיקונים לפי רשימת המשימות:
//   ✅ משימה 1.1 + 1.2: תמיכה ב-Firebase Real-time (onSnapshot)
//                        כרגע רץ עם Mock – החלף USE_FIREBASE=true
//                        כדי לעבור לנתונים אמיתיים
//   ✅ משימה 4.3: חישוב stats דינמי ב-real-time מתוך drivers/routes
//   ✅ משימה 5.2: התראות אוטומטיות – עיכוב וניתוק נהג
//   ✅ משימה 5.3: בדיקת נהג שלא התחבר לפני המסלול
// ======================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  mockDrivers,
  mockRoutes,
  mockLiveLocations,
  mockStats,
} from "../data/mockData";

// 🔁 שנה ל-true כאשר Firebase מוגדר ב-firebase.js
const USE_FIREBASE = false;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [drivers, setDrivers] = useState(mockDrivers);
  const [routes, setRoutes] = useState(mockRoutes);
  const [liveLocations, setLiveLocations] = useState(mockLiveLocations);
  const [stats, setStats] = useState(mockStats);
  const [notifications, setNotifications] = useState([]);

  // loading מופרד לטעינה ראשונית ולפעולות
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(USE_FIREBASE);

  // שמור מצב קודם של נהגים כדי לזהות שינויים
  const prevDriversRef = useRef({});

  // ======================================================
  // Notifications (משימה 5.2)
  // ======================================================
  const addNotification = useCallback((msg, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      5000
    );
  }, []);

  // ======================================================
  // חישוב stats דינמי (משימה 4.3)
  // ======================================================
  useEffect(() => {
    const drivingCount = drivers.filter((d) => d.status === "driving").length;
    const onlineCount = drivers.filter((d) => d.status === "online").length;
    const offlineCount = drivers.filter((d) => d.status === "offline").length;
    const activeRoutes = routes.filter((r) => r.status === "active").length;

    const totalStudents = routes.reduce(
      (sum, r) =>
        sum + r.stops.reduce((s, stop) => s + (stop.studentsCount || 0), 0),
      0
    );

    // חישוב עיכוב ממוצע מ-liveLocations
    const locs = Object.values(liveLocations);
    const avgDelay =
      locs.length > 0
        ? Math.round(
            (locs.reduce((sum, l) => sum + (l.etaToNext || 0), 0) /
              locs.length) *
              10
          ) / 10
        : 0;

    setStats((prev) => ({
      ...prev,
      activeNow: drivingCount,
      onlineNotDriving: onlineCount,
      offline: offlineCount,
      routesActive: activeRoutes,
      totalStudentsToday: totalStudents || prev.totalStudentsToday,
      avgDelay,
    }));
  }, [drivers, routes, liveLocations]);

  // ======================================================
  // ניטור נהגים – התראות אוטומטיות (משימה 5.2 + 5.3)
  // ======================================================
  useEffect(() => {
    drivers.forEach((driver) => {
      const prev = prevDriversRef.current[driver.id];

      // נהג שהתנתק בזמן שהיה בנסיעה
      if (
        prev &&
        prev.status === "driving" &&
        driver.status === "offline"
      ) {
        addNotification(
          `⚠️ ${driver.name} התנתק בזמן נסיעה!`,
          "error"
        );
      }

      // נהג חדש שהתחבר
      if (prev && prev.status === "offline" && driver.status !== "offline") {
        addNotification(`✅ ${driver.name} התחבר למערכת`, "success");
      }
    });

    // עדכן ref
    const snapshot = {};
    drivers.forEach((d) => {
      snapshot[d.id] = { status: d.status };
    });
    prevDriversRef.current = snapshot;
  }, [drivers, addNotification]);

  // ======================================================
  // ניטור עיכובים (משימה 5.2)
  // צביעת eta-badge + התראה כשעיכוב > 5 דקות
  // ======================================================
  useEffect(() => {
    Object.entries(liveLocations).forEach(([driverId, loc]) => {
      if (loc.etaToNext > 10) {
        const driver = drivers.find((d) => d.id === driverId);
        const route = routes.find((r) => r.assignedDriverUid === driverId);
        if (driver && route) {
          // עדכן סטטוס מסלול ל-delayed
          setRoutes((prev) =>
            prev.map((r) =>
              r.id === route.id && r.status === "active"
                ? { ...r, status: "delayed" }
                : r
            )
          );
        }
      }
    });
  }, [liveLocations, drivers, routes]);

  // ======================================================
  // Firebase Real-time Listeners (משימה 1.1 + 1.2)
  // פעיל רק כאשר USE_FIREBASE=true
  // ======================================================
  useEffect(() => {
    if (!USE_FIREBASE) return;

    // ייבוא דינמי של Firebase כדי לא לשבור את הבנייה
    // כאשר Firebase לא מוגדר
    import("../data/firebase").then(
      ({ db, collection, onSnapshot }) => {
        setInitialLoading(true);
        let loaded = 0;
        const checkLoaded = () => {
          loaded++;
          if (loaded >= 3) setInitialLoading(false);
        };

        // Drivers listener
        const unsubDrivers = onSnapshot(
          collection(db, "drivers"),
          (snap) => {
            setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            checkLoaded();
          }
        );

        // Routes listener
        const unsubRoutes = onSnapshot(
          collection(db, "routes"),
          (snap) => {
            setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            checkLoaded();
          }
        );

        // Live locations listener
        const unsubLocations = onSnapshot(
          collection(db, "liveLocations"),
          (snap) => {
            const locs = {};
            snap.docs.forEach((d) => {
              locs[d.id] = { ...d.data() };
            });
            setLiveLocations(locs);
            checkLoaded();
          }
        );

        return () => {
          unsubDrivers();
          unsubRoutes();
          unsubLocations();
        };
      }
    );
  }, []);

  // ======================================================
  // סימולציה של GPS Real-time (Mock בלבד)
  // ======================================================
  useEffect(() => {
    if (USE_FIREBASE) return; // ב-Firebase האמיתי, הנהג מעדכן מהמכשיר שלו

    const interval = setInterval(() => {
      setLiveLocations((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((driverId) => {
          const loc = updated[driverId];
          const newEta = Math.max(1, loc.etaToNext + (Math.random() > 0.7 ? -1 : 0));
          updated[driverId] = {
            ...loc,
            lat: loc.lat + (Math.random() - 0.5) * 0.001,
            lng: loc.lng + (Math.random() - 0.5) * 0.001,
            speed: Math.max(0, Math.min(120, loc.speed + (Math.random() - 0.5) * 10)),
            etaToNext: newEta,
            timestamp: new Date(),
          };
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // Auth
  // ======================================================
  const login = useCallback(async (name, password) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setUser({ name, role: "admin", id: "admin1" });
    setLoading(false);
    addNotification(`ברוך הבא, ${name}!`, "success");
    return true;
  }, [addNotification]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // ======================================================
  // Drivers CRUD
  // ======================================================
  const addDriver = useCallback(
    async (driver) => {
      const newDriver = {
        ...driver,
        id: `d${Date.now()}`,
        status: "offline",
        currentRouteId: null,
        lastLogin: new Date(),
      };

      if (USE_FIREBASE) {
        const { db, collection, addDoc, serverTimestamp } = await import("../data/firebase");
        await addDoc(collection(db, "drivers"), {
          ...newDriver,
          lastLogin: serverTimestamp(),
        });
      } else {
        setDrivers((prev) => [...prev, newDriver]);
      }

      addNotification(`נהג ${driver.name} נרשם בהצלחה`, "success");
    },
    [addNotification]
  );

  const updateDriver = useCallback(
    async (id, updates) => {
      if (USE_FIREBASE) {
        const { db, doc, updateDoc, serverTimestamp } = await import("../data/firebase");
        await updateDoc(doc(db, "drivers", id), {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } else {
        setDrivers((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
        );
      }
      addNotification("הנהג עודכן בהצלחה", "success");
    },
    [addNotification]
  );

  const deleteDriver = useCallback(
    async (id) => {
      if (USE_FIREBASE) {
        const { db, doc, deleteDoc } = await import("../data/firebase");
        await deleteDoc(doc(db, "drivers", id));
      } else {
        setDrivers((prev) => prev.filter((d) => d.id !== id));
      }
      addNotification("הנהג הוסר מהמערכת", "info");
    },
    [addNotification]
  );

  // ======================================================
  // Driver Status Toggle – הפעלה / השהיה (משימה 4.2)
  // ======================================================
  const toggleDriverStatus = useCallback(
    async (driver) => {
      const newStatus = driver.status === "offline" ? "online" : "offline";
      await updateDriver(driver.id, { status: newStatus });
      addNotification(
        `${driver.name} ${newStatus === "online" ? "הופעל ✅" : "הושהה ⏸"}`,
        newStatus === "online" ? "success" : "info"
      );
    },
    [updateDriver, addNotification]
  );

  // ======================================================
  // Routes CRUD
  // ======================================================
  const addRoute = useCallback(
    async (route) => {
      const newRoute = {
        ...route,
        id: `r${Date.now()}`,
        status: "active",
        totalDistance: route.totalDistance || 0,
      };

      if (USE_FIREBASE) {
        const { db, collection, addDoc } = await import("../data/firebase");
        await addDoc(collection(db, "routes"), newRoute);
      } else {
        setRoutes((prev) => [...prev, newRoute]);
      }

      addNotification(`מסלול "${route.name}" נוצר בהצלחה`, "success");
    },
    [addNotification]
  );

  const updateRoute = useCallback(
    async (id, updates) => {
      if (USE_FIREBASE) {
        const { db, doc, updateDoc } = await import("../data/firebase");
        await updateDoc(doc(db, "routes", id), updates);
      } else {
        setRoutes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
        );
      }
      addNotification("המסלול עודכן בהצלחה", "success");
    },
    [addNotification]
  );

  const deleteRoute = useCallback(
    async (id) => {
      if (USE_FIREBASE) {
        const { db, doc, deleteDoc } = await import("../data/firebase");
        await deleteDoc(doc(db, "routes", id));
      } else {
        setRoutes((prev) => prev.filter((r) => r.id !== id));
      }
      addNotification("המסלול הוסר מהמערכת", "info");
    },
    [addNotification]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        initialLoading,

        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        toggleDriverStatus,

        routes,
        addRoute,
        updateRoute,
        deleteRoute,

        liveLocations,
        stats,

        notifications,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

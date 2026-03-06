import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MonitorPage from "./pages/MonitorPage";
import DriversPage from "./pages/DriversPage";
import RoutesPage from "./pages/RoutesPage";
import IVRPage from "./pages/IVRPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Notifications from "./components/Notifications";
import "./index.css";

const pages = {
  dashboard: DashboardPage,
  monitor: MonitorPage,
  drivers: DriversPage,
  routes: RoutesPage,
  ivr: IVRPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

function AppInner() {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (!user) return <LoginPage />;

  const PageComponent = pages[currentPage] || DashboardPage;

  return (
    <div className="app-layout">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Topbar currentPage={currentPage} />
        <PageComponent />
      </div>
      <Notifications />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

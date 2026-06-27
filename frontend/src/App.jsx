import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'; // Import global styles and CSS variables

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth guards
import ProtectedRoute from "./components/auth/ProtectedRoute/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute/RoleRoute";

// Public pages
import Landing from "./pages/public/Landing/Landing";
import Login from "./pages/public/Login/Login";
import Signup from "./pages/public/Signup/Signup";

// User pages
import UserDashboard from "./pages/user/UserDashboard/UserDashboard";
import ReportWaste from "./pages/user/ReportWaste/ReportWaste";
import PickupRequest from "./pages/user/PickupRequest/PickupRequest";
import PickupTracking from "./pages/user/PickupTracking/PickupTracking";
import AiScanner from "./pages/user/AiScanner/AiScanner";
import History from "./pages/user/History/History";
import Profile from "./pages/user/Profile/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement/UserManagement";
import PickupManagement from "./pages/admin/PickupManagement/PickupManagement";
import RouteManagement from "./pages/admin/RouteManagement/RouteManagement";
import Analytics from "./pages/admin/Analytics/Analytics";
import AiInsights from "./pages/admin/AiInsights/AiInsights";

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* ── 1. Public Routes ─────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── 2. User Routes (authenticated) ────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRole="user" />}>
            <Route element={<UserLayout />}>
              {/* Redirect /user to /dashboard or just use /dashboard */}
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/report-waste" element={<ReportWaste />} />
              <Route path="/pickup-request" element={<PickupRequest />} />
              <Route path="/pickup-tracking" element={<PickupTracking />} />
              <Route path="/ai-scanner" element={<AiScanner />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Route>

        {/* ── 3. Admin Routes (authenticated) ───────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/pickups" element={<PickupManagement />} />
              <Route path="/admin/routes" element={<RouteManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/ai-insights" element={<AiInsights />} />
            </Route>
          </Route>
        </Route>

        {/* ── 4. Catch-all Redirect ────────────────────── */}
        {/* If no path matches, send user to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
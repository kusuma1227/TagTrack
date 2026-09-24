import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ScanPage from './pages/public/ScanPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import RegisterItemPage from './pages/owner/RegisterItemPage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

/**
 * App — Root routing component.
 *
 * Route structure:
 *   /                  → Landing page (public)
 *   /login             → Login page (public, redirects if authenticated)
 *   /register          → Register page (public, redirects if authenticated)
 *   /scan              → Public item scan/search
 *   /dashboard         → Owner/Finder dashboard (protected)
 *   /officer/dashboard → Officer dashboard (protected + role=officer/admin)
 *   /admin/dashboard   → Admin dashboard (protected + role=admin)
 *
 * All protected routes render Navbar above the page content.
 */
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

const App = () => {
  return (
    <Routes>
      {/* ── Public Routes ──────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <AppLayout>
            <LandingPage />
          </AppLayout>
        }
      />
      <Route
        path="/login"
        element={
          <AppLayout>
            <LoginPage />
          </AppLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AppLayout>
            <RegisterPage />
          </AppLayout>
        }
      />
      <Route
        path="/scan"
        element={
          <AppLayout>
            <ScanPage />
          </AppLayout>
        }
      />
      <Route
        path="/scan/:tagId"
        element={
          <AppLayout>
            {/* Phase 3: Public tag report found view */}
            <ScanPage />
          </AppLayout>
        }
      />

      {/* ── Owner / Finder Dashboard ────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RoleRoute allowedRoles={['owner', 'finder']}>
                <OwnerDashboard />
              </RoleRoute>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RoleRoute allowedRoles={['owner', 'finder']}>
                <OwnerDashboard />
              </RoleRoute>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/register"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RoleRoute allowedRoles={['owner', 'admin']}>
                <RegisterItemPage />
              </RoleRoute>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Officer Dashboard ─────────────────────────────────────────────── */}
      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RoleRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard />
              </RoleRoute>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Admin Dashboard ───────────────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── 404 Fallback ──────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

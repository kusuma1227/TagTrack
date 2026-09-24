import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * RoleRoute
 * ---
 * Must be used INSIDE a ProtectedRoute.
 * Checks if the authenticated user's role is in the allowedRoles array.
 * Redirects to a role-appropriate dashboard if access is denied.
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard
    const dashboardRoutes = {
      owner: '/dashboard',
      finder: '/dashboard',
      officer: '/officer/dashboard',
      admin: '/admin/dashboard',
    };
    const fallback = dashboardRoutes[user?.role] || '/login';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RoleRoute;

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Route guard. Sends signed-out visitors to the login belonging to the
 * area they tried to reach, and sends signed-in users of the *wrong*
 * role to their own home rather than to a dead end.
 */
export default function RequireAuth({ role }) {
  const { user } = useAuth();
  const location = useLocation();
  const loginPath = role === 'admin' ? '/admin/login' : '/login';

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location.pathname + location.search }} replace />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  }
  return <Outlet />;
}

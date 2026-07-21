import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

/**
 * Route guard requiring active authenticated session.
 * Stores target path in location state for post-login redirecting.
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner">Loading session...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  );
}

/**
 * Route guard blocking authenticated users from guest page portals (Login/Register).
 */
export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
}

/**
 * Route guard restricting pages to specific user roles.
 * Redirects unauthorized users safely back to Home path.
 * @param {Object} props { allowedRoles: string[] }
 */
export function RoleRoute({ allowedRoles }) {
  const { currentUser, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return allowedRoles.includes(currentUser.role) ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.HOME} replace />
  );
}

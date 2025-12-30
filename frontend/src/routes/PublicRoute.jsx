/**
 * Public Route Component
 * 
 * Wrapper component for public routes (login, signup).
 * Redirects authenticated users to dashboard.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../utils/constants';

/**
 * PublicRoute Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.restricted - If true, redirect authenticated users
 * @param {string} props.redirectTo - Redirect path for authenticated users
 */
export function PublicRoute({ 
  children, 
  restricted = true,
  redirectTo = ROUTES.DASHBOARD 
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users away from public-only routes
  if (isAuthenticated && restricted) {
    // Check if there's a saved location to redirect to
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
}

export default PublicRoute;
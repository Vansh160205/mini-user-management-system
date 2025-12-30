/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes from unauthorized access.
 * Redirects to login if user is not authenticated.
 * Optionally restricts access based on user roles.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../utils/constants';

/**
 * ProtectedRoute Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.roles - Required role(s) for access
 * @param {string} props.redirectTo - Redirect path if unauthorized
 */
export function ProtectedRoute({ 
  children, 
  roles = null,
  redirectTo = ROUTES.LOGIN 
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if roles are specified
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRole = allowedRoles.includes(user?.role);

    if (!hasRequiredRole) {
      // Redirect to dashboard or show unauthorized page
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <Navigate to={ROUTES.DASHBOARD} replace />
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required role
  return children;
}

export default ProtectedRoute;
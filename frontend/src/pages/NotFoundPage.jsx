/**
 * Not Found Page Component
 * 
 * 404 error page for undefined routes.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../utils/constants';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="btn-primary"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
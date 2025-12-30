/**
 * Login Page Component
 * 
 * Placeholder for the login page.
 * Full implementation will be added in a future commit.
 */

import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {/* Placeholder form */}
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm text-yellow-800">
            Login form will be implemented in the next commit.
          </p>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to={ROUTES.SIGNUP} className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
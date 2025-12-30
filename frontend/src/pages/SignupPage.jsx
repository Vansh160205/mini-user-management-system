/**
 * Signup Page Component
 * 
 * Placeholder for the signup page.
 * Full implementation will be added in a future commit.
 */

import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export function SignupPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="text-gray-600 mt-2">Get started with your free account</p>
      </div>

      {/* Placeholder form */}
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm text-yellow-800">
            Signup form will be implemented in the next commit.
          </p>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
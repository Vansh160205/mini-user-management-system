/**
 * Profile Page Component
 * 
 * Placeholder for the user profile page.
 * Full implementation will be added in a future commit.
 */

import { useAuth } from '../hooks';
import { formatDate } from '../utils/helpers';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                {user?.role}
              </span>
              <span className={`badge ${user?.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {user?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-gray-500">Full Name</dt>
              <dd className="text-gray-900 font-medium">{user?.full_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900 font-medium">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className="text-gray-900 font-medium capitalize">{user?.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900 font-medium capitalize">{user?.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Member Since</dt>
              <dd className="text-gray-900 font-medium">{formatDate(user?.created_at)}</dd>
            </div>
          </dl>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-6">
          <p className="text-sm text-yellow-800">
            Profile editing will be implemented in a future commit.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
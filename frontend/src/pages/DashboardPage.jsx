/**
 * Dashboard Page Component
 * 
 * Main dashboard with user statistics and quick actions.
 * Shows different content based on user role (admin vs user).
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { userService } from '../services';
import { Card, Spinner, Alert } from '../components/ui';
import { ROUTES } from '../utils/constants';
import { formatDate, formatNumber } from '../utils/helpers';

export function DashboardPage() {
  const { user, isAdmin } = useAuth();

  // State
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  /**
   * Fetch user statistics (admin only)
   */
  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const response = await userService.getUserStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setStatsError(response.message || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
      setStatsError(error.message || 'Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Render Admin Dashboard
   */
  const renderAdminDashboard = () => (
    <>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name}!</h2>
        <p className="text-primary-100">
          You're logged in as an administrator. Here's an overview of your system.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
          {!isLoadingStats && stats && (
            <button
              onClick={fetchStats}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {isLoadingStats ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : statsError ? (
          <Alert variant="error" closable onClose={() => setStatsError(null)}>
            {statsError}
          </Alert>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <Card hover className="border-l-4 border-primary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatNumber(stats.totalUsers || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Link to={ROUTES.USERS} className="text-primary-600 hover:text-primary-700 font-medium">
                  View all users →
                </Link>
              </div>
            </Card>

            {/* Active Users */}
            <Card hover className="border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatNumber(stats.activeCount || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalUsers > 0 ? (stats.activeCount / stats.totalUsers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {stats.totalUsers > 0
                      ? Math.round((stats.activeCount / stats.totalUsers) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Inactive Users */}
            <Card hover className="border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatNumber(stats.inactiveCount || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalUsers > 0 ? (stats.inactiveCount / stats.totalUsers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {stats.totalUsers > 0
                      ? Math.round((stats.inactiveCount / stats.totalUsers) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Admin Users */}
            <Card hover className="border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatNumber(stats.adminCount || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Regular Users: {formatNumber(stats.userCount || 0)}
              </div>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={ROUTES.USERS}>
            <Card hover className="text-center p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Manage Users</h4>
              <p className="text-sm text-gray-600">View, edit, and manage all users</p>
            </Card>
          </Link>

          <Link to={ROUTES.PROFILE}>
            <Card hover className="text-center p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Your Profile</h4>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </Card>
          </Link>

          <Card hover className="text-center p-6 cursor-pointer transition-all hover:shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">System Settings</h4>
            <p className="text-sm text-gray-600">Configure system preferences</p>
          </Card>
        </div>
      </div>

      {/* System Info */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </Card.Header>
        <Card.Body>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-600">System Status</dt>
              <dd className="mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-900">All Systems Operational</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Database</dt>
              <dd className="mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm font-medium text-gray-900">Connected</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Last Backup</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">N/A</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">API Version</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">v1.0.0</dd>
            </div>
          </dl>
        </Card.Body>
      </Card>
    </>
  );

  /**
   * Render User Dashboard
   */
  const renderUserDashboard = () => (
    <>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white mb-6">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}! 👋</h2>
        <p className="text-primary-100 text-lg">
          Great to see you again. Manage your account and explore your options.
        </p>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Your Role</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{user?.status}</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to={ROUTES.PROFILE}>
            <Card hover className="p-6 cursor-pointer transition-all hover:shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900">Edit Profile</h4>
                  <p className="text-sm text-gray-600">Update your personal information</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>

          <Card hover className="p-6 cursor-pointer transition-all hover:shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-600">Update your security credentials</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Card>
        </div>
      </div>

      {/* Account Details */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
        </Card.Header>
        <Card.Body>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-600">Full Name</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{user?.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Email Address</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Account Role</dt>
              <dd className="mt-1">
                <span className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                  {user?.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Account Status</dt>
              <dd className="mt-1">
                <span className={`badge ${user?.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {user?.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Account Created</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{formatDate(user?.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Last Updated</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{formatDate(user?.updated_at)}</dd>
            </div>
          </dl>
        </Card.Body>
      </Card>

      {/* Help Section */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Need Help?</h3>
            <p className="text-sm text-gray-700 mb-3">
              If you have any questions or need assistance, please don't hesitate to contact support.
            </p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Contact Support →
            </button>
          </div>
        </div>
      </Card>
    </>
  );

  return (
    <div className="space-y-6">
      {isAdmin ? renderAdminDashboard() : renderUserDashboard()}
    </div>
  );
}

export default DashboardPage;
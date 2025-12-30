/**
 * Routes Configuration
 * 
 * Central routing configuration for the application.
 * Defines all routes and their access requirements.
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages (placeholder components for now)
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import UsersPage from '../pages/UsersPage';
import NotFoundPage from '../pages/NotFoundPage';

// Constants
import { ROUTES, ROLES } from '../utils/constants';

/**
 * Router Configuration
 */
const router = createBrowserRouter([
  // Public routes with AuthLayout
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.SIGNUP,
        element: (
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        ),
      },
    ],
  },

  // Protected routes with MainLayout
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProfilePage />,
      },
      {
        path: ROUTES.USERS,
        element: (
          <ProtectedRoute roles={ROLES.ADMIN}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Home page (public)
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },

  // 404 Not Found
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);

/**
 * AppRouter Component
 * Provides router to the application
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}

// Export route guards
export { ProtectedRoute, PublicRoute };

export default AppRouter;
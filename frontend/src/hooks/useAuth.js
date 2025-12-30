/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication context.
 * Provides type-safe access to auth state and methods.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to access authentication context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure to wrap your component tree with <AuthProvider>.'
    );
  }

  return context;
}

/**
 * Hook to check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get current user
 * @returns {Object|null} Current user or null
 */
export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if current user is admin
 * @returns {boolean} True if admin
 */
export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

/**
 * Hook to check user role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} True if user has required role
 */
export function useHasRole(requiredRoles) {
  const { hasRole } = useAuth();
  return hasRole(requiredRoles);
}

/**
 * Hook to get auth loading state
 * @returns {boolean} True if loading
 */
export function useAuthLoading() {
  const { isLoading } = useAuth();
  return isLoading;
}

export default useAuth;
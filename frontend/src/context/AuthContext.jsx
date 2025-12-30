/**
 * Authentication Context
 * 
 * Provides global authentication state management.
 * Handles:
 * - User authentication state
 * - Login/Logout functionality
 * - Token verification on app load
 * - User data persistence
 */

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services';

// Create Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication state on app load
   * Verifies stored token and fetches user data
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getStoredUser();

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Set initial state from storage
        setToken(storedToken);
        setUser(storedUser);

        // Verify token with server
        const verifyResponse = await authService.verifyToken();

        if (verifyResponse.success && verifyResponse.data?.valid) {
          // Token is valid, fetch fresh user data
          const userResponse = await authService.getCurrentUser();
          
          if (userResponse.success && userResponse.data?.user) {
            setUser(userResponse.data.user);
            setIsAuthenticated(true);
          } else {
            // Failed to get user, clear auth
            handleLogout();
          }
        } else {
          // Token invalid, clear auth
          handleLogout();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // On error, clear auth state
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Login result
   */
  const login = useCallback(async (credentials) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle user signup
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.full_name - User full name
   * @returns {Promise<Object>} - Signup result
   */
  const signup = useCallback(async (userData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.signup(userData);

      if (response.success && response.data) {
        const { user: newUser, token: authToken } = response.data;
        
        setUser(newUser);
        setToken(authToken);
        setIsAuthenticated(true);

        return { success: true, user: newUser };
      }

      return { success: false, message: response.message || 'Signup failed' };
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage, errors: err.errors };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Refresh user data from server
   * @returns {Promise<Object>} - Refresh result
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }

      return { success: false, message: 'Failed to refresh user data' };
    } catch (err) {
      console.error('Refresh user error:', err);
      return { success: false, message: err.message };
    }
  }, []);

  /**
   * Update user data in context (for local updates without API call)
   * @param {Object} updates - User data updates
   */
  const updateUser = useCallback((updates) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean} - True if user has role
   */
  const hasRole = useCallback((roles) => {
    if (!user?.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }, [user]);

  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    isAdmin,
    
    // Actions
    login,
    signup,
    logout: handleLogout,
    refreshUser,
    updateUser,
    clearError,
    hasRole,
  }), [
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    isAdmin,
    login,
    signup,
    handleLogout,
    refreshUser,
    updateUser,
    clearError,
    hasRole,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
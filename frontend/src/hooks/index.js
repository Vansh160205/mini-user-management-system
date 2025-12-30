/**
 * Hooks Index
 * 
 * Central export for all custom hooks
 */

export { 
  useAuth, 
  useIsAuthenticated, 
  useCurrentUser, 
  useIsAdmin,
  useHasRole,
  useAuthLoading,
} from './useAuth';

export { useLocalStorage } from './useLocalStorage';
export { useAsync, useFetch } from './useAsync';

// Default exports
export { default as useAuthDefault } from './useAuth';
export { default as useLocalStorageDefault } from './useLocalStorage';
export { default as useAsyncDefault } from './useAsync';
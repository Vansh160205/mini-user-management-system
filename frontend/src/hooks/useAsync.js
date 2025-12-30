/**
 * useAsync Hook
 * 
 * Custom hook for handling async operations with loading and error states.
 * Provides consistent pattern for API calls.
 */

import { useState, useCallback } from 'react';

/**
 * Hook for managing async operations
 * @param {Function} asyncFunction - Async function to execute
 * @param {Object} options - Hook options
 * @param {boolean} options.immediate - Execute immediately on mount
 * @returns {Object} - { execute, loading, error, data, reset }
 */
export function useAsync(asyncFunction, options = {}) {
  const { immediate = false } = options;

  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute the async function
   * @param {...*} args - Arguments to pass to async function
   * @returns {Promise<*>} - Result of async function
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook for immediate async execution on mount
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} dependencies - Dependency array for re-execution
 * @returns {Object} - { loading, error, data, refetch }
 */
export function useFetch(asyncFunction, dependencies = []) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, ...dependencies]);

  // Fetch on mount and when dependencies change
  useState(() => {
    fetchData();
  });

  return {
    loading,
    error,
    data,
    refetch: fetchData,
    setData,
  };
}

export default useAsync;
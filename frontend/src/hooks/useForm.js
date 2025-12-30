/**
 * useForm Hook
 * 
 * Custom hook for managing form state and validation.
 * Provides a consistent pattern for form handling.
 */

import { useState, useCallback } from 'react';

/**
 * useForm Hook
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} - Form state and handlers
 */
export function useForm(initialValues = {}, validate = null, onSubmit = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate single field on blur if validate function exists
    if (validate) {
      const validation = validate(values);
      if (validation.errors && validation.errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validation.errors[name],
        }));
      }
    }
  }, [values, validate]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const touchedFields = {};
    Object.keys(values).forEach((key) => {
      touchedFields[key] = true;
    });
    setTouched(touchedFields);

    // Validate all fields
    if (validate) {
      const validation = validate(values);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    // Submit form
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set specific field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set specific field error
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Set multiple errors
   */
  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setFormErrors,
    setValues,
  };
}

export default useForm;
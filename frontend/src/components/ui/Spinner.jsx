/**
 * Spinner Component
 * 
 * Reusable loading spinner component.
 * Supports different sizes and colors.
 */

const sizes = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colors = {
  primary: 'border-primary-600',
  white: 'border-white',
  gray: 'border-gray-600',
  success: 'border-success-600',
  danger: 'border-danger-600',
};

/**
 * Spinner Component
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...',
}) {
  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.primary;

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-transparent ${sizeClass} ${colorClass} ${className}`}
        role="status"
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

/**
 * FullPageSpinner Component
 * Displays spinner centered on full page
 */
export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
}

export default Spinner;
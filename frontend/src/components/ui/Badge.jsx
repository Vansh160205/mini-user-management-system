/**
 * Badge Component
 * 
 * Reusable badge component for labels and status indicators.
 */

const variants = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Badge Component
 */
export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
  dot = false,
}) {
  const variantClasses = variants[variant] || variants.gray;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variantClasses} ${sizeClasses} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${variant === 'success' ? 'bg-green-500' : variant === 'error' ? 'bg-red-500' : variant === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
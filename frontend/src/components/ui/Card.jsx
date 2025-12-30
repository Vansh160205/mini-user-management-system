/**
 * Card Component
 * 
 * Reusable card container component.
 */

/**
 * Card Component
 */
export function Card({
  children,
  className = '',
  padding = true,
  hover = false,
}) {
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const paddingClasses = padding ? 'p-6' : '';

  return (
    <div className={`bg-white rounded-lg shadow-md ${paddingClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardHeader Component
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardBody Component
 */
export function CardBody({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * CardFooter Component
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
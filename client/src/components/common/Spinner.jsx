import { memo } from 'react';

/**
 * Reusable loading spinner.
 */
const Spinner = memo(({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'h-4 w-4 stroke-[3]',
    md: 'h-8 w-8 stroke-[2]',
    lg: 'h-12 w-12 stroke-[1.5]',
  };

  return (
    <div className={`text-indigo-500 dark:text-indigo-400 ${className}`} role="status">
      <svg
        className={`animate-spin ${sizes[size]}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
});

Spinner.displayName = 'Spinner';

export default Spinner;

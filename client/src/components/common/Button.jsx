import { memo } from 'react';

/**
 * Reusable accessible Button component.
 */
const Button = memo(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50',
    outline: 'bg-transparent text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-rose-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

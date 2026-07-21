import { forwardRef } from 'react';

/**
 * Reusable accessible Select dropdown component.
 */
const Select = forwardRef(({
  label,
  id,
  options = [],
  error,
  className = '',
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-semibold text-slate-400 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-900 border text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all duration-150 ${
          error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800'
        } ${className}`}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span 
          id={errorId} 
          className="text-xs text-rose-500 font-medium"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

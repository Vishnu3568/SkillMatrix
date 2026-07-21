import { forwardRef } from 'react';

/**
 * Reusable accessible Checkbox component.
 */
const Checkbox = forwardRef(({
  label,
  id,
  error,
  className = '',
  ...props
}, ref) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-2.5">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`h-4.5 w-4.5 rounded border bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500/40 focus:ring-offset-0 disabled:opacity-50 transition-all duration-150 ${className}`}
          {...props}
        />
        {label && (
          <label 
            htmlFor={id} 
            className="text-sm font-medium text-slate-300 select-none cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <span 
          id={errorId} 
          className="text-xs text-rose-500 font-medium ml-7"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

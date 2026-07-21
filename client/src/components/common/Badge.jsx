import { memo } from 'react';

/**
 * Reusable Badge status component.
 */
const Badge = memo(({
  children,
  variant = 'info',
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border';

  const variants = {
    primary: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/25',
    success: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/25',
    danger: 'bg-rose-950/40 text-rose-400 border-rose-500/25',
    warning: 'bg-amber-950/40 text-amber-400 border-amber-500/25',
    info: 'bg-slate-800 text-slate-300 border-slate-700/50',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;

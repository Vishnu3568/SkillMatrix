import { memo } from 'react';

/**
 * Reusable Page Header component.
 */
const PageHeader = memo(({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/5 mb-6 ${className}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0">{action}</div>}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;

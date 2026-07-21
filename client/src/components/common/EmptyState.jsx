import { memo } from 'react';

/**
 * Reusable Empty State component.
 */
const EmptyState = memo(({
  title = 'No results found',
  description = 'Try adjusting your search filters or check back later.',
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl max-w-md mx-auto w-full my-6 bg-slate-900/20">
      {icon ? (
        <div className="text-slate-500 mb-4">{icon}</div>
      ) : (
        <svg 
          className="h-12 w-12 text-slate-600 dark:text-slate-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v4.5A2.25 2.25 0 002.25 13.5z" />
        </svg>
      )}
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;

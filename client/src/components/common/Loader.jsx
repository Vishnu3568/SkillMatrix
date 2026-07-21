import { memo } from 'react';
import Spinner from './Spinner';

/**
 * Reusable loading container/page spinner.
 */
const Loader = memo(({
  fullscreen = false,
  message = 'Loading...',
}) => {
  const containerClass = fullscreen 
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-8 w-full';

  return (
    <div className={containerClass} aria-busy="true">
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-sm font-semibold text-indigo-400 dark:text-indigo-300 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;

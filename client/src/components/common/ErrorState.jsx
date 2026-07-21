import { memo } from 'react';
import Button from './Button';

/**
 * Reusable Error State component.
 */
const ErrorState = memo(({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  retryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-rose-950/20 bg-rose-950/5 rounded-xl max-w-md mx-auto w-full my-6">
      <svg 
        className="h-12 w-12 text-rose-500/80 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">{message}</p>
      {retryAction && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={retryAction} 
          className="mt-5 border-rose-950 text-rose-400 hover:bg-rose-950/20"
        >
          Try Again
        </Button>
      )}
    </div>
  );
});

ErrorState.displayName = 'ErrorState';

export default ErrorState;

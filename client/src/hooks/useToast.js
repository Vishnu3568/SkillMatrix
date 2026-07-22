import { useMemo } from 'react';
import { useToastContext } from '../context/ToastContext';

/**
 * Custom hook providing simplified access to the toast notification system.
 * Returns a memoized object so it can safely be used in useEffect dependency arrays.
 * Usage:
 *   const toast = useToast();
 *   toast.success('Successfully loaded page!');
 */
export default function useToast() {
  const { addToast } = useToastContext();

  return useMemo(() => ({
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  }), [addToast]);
}
export { useToastContext };

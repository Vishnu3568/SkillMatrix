import { useToastContext } from '../context/ToastContext';

/**
 * Custom hook providing simplified access to the toast notification system.
 * Usage:
 *   const toast = useToast();
 *   toast.success('Successfully loaded page!');
 */
export default function useToast() {
  const { addToast } = useToastContext();

  return {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };
}
export { useToastContext };

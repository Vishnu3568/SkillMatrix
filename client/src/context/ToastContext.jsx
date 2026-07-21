/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
        aria-live="assertive"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            onClick={() => removeToast(toast.id)}
            className={`p-4 rounded-lg shadow-lg border flex items-center justify-between cursor-pointer transition-all duration-300 transform translate-y-0 scale-100 ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/30 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-slate-900 border-rose-500/30 text-rose-400'
                : toast.type === 'warning'
                ? 'bg-slate-900 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-indigo-500/30 text-indigo-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'warning' && '⚠'}
                {toast.type === 'info' && 'ℹ'}
              </span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button 
              className="text-xs ml-4 opacity-50 hover:opacity-100 focus:outline-none"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

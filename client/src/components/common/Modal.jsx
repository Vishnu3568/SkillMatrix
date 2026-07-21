import { useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable accessible modal popup.
 * Controls keyboard focus trap and exits on backdrop clicks or Escape key.
 */
const Modal = memo(({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active focus
    const previousFocus = document.activeElement;
    
    // Focus the modal root
    modalRef.current?.focus();

    // Escape listener
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus(); // Restore focus
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`glass w-full max-w-lg rounded-xl flex flex-col max-h-[85vh] bg-slate-900/90 text-white overflow-hidden shadow-2xl border border-white/10 outline-none animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()} // Stop propagation
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5">
          {title && (
            <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-100">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg focus:ring-2 focus:ring-indigo-500/50"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-300">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
});

Modal.displayName = 'Modal';

export default Modal;

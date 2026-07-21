import { memo } from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * Reusable accessible Confirm Dialog.
 */
const ConfirmDialog = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-300">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;

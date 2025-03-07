import React from 'react';
import Modal from './Modal';
import Button from '../Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  confirmButtonVariant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  className?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  confirmButtonVariant = 'primary',
  isLoading = false,
  className = '',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
      showCloseButton={!isLoading}
      closeOnOutsideClick={!isLoading}
    >
      <div className="p-6">
        <div className="text-center mb-6">
          {icon && <div className="mx-auto mb-4">{icon}</div>}
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          
          <div className="text-gray-300 text-sm leading-relaxed">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
            className="sm:w-auto sm:flex-1"
          >
            {confirmText}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            fullWidth
            className="sm:w-auto sm:flex-1"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

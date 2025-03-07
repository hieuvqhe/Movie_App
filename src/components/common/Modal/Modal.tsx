import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'center' | 'top';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  showCloseButton = true,
  closeOnOutsideClick = true,
  size = 'md',
  position = 'center',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto'; // Restore scrolling
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Define size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Define position classes
  const positionClasses = {
    center: 'items-center',
    top: 'items-start pt-16',
  };

  if (!isOpen) return null;

  // Use portal to render at the end of the document body
  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-50 bg-black/70 flex justify-center ${positionClasses[position]} p-4 animate-fadeIn`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]}
          animate-scaleIn overflow-hidden flex flex-col
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton && (
          <button
            className="absolute right-4 top-4 text-gray-400 hover:text-white z-10"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

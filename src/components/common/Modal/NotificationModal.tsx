import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import Modal from './Modal';
import Button from '../Button';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  type?: NotificationType;
  buttonText?: string;
  autoDismiss?: boolean;
  dismissTimeout?: number;
  className?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
  autoDismiss = false,
  dismissTimeout = 3000,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, dismissTimeout);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss, dismissTimeout, onClose]);

  const iconMap: Record<NotificationType, React.ReactNode> = {
    success: <FiCheckCircle size={40} className="text-green-500" />,
    error: <FiXCircle size={40} className="text-red-500" />,
    warning: <FiAlertTriangle size={40} className="text-yellow-500" />,
    info: <FiInfo size={40} className="text-blue-500" />,
  };

  const icon = iconMap[type];

  const buttonVariantMap: Record<NotificationType, 'primary' | 'secondary' | 'outline'> = {
    success: 'primary',
    error: 'primary',
    warning: 'secondary',
    info: 'secondary',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex justify-center">{icon}</div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          
          <div className="text-gray-300 text-sm leading-relaxed">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            variant={buttonVariantMap[type]}
            onClick={onClose}
            className="min-w-[120px]"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;

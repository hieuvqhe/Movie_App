import { useState, useCallback } from 'react';
import NotificationModal, { NotificationType } from './NotificationModal';

type NotificationOptions = {
  title: string;
  message: React.ReactNode;
  type?: NotificationType;
  buttonText?: string;
  autoDismiss?: boolean;
  dismissTimeout?: number;
};

type NotificationHook = {
  showNotification: (options: NotificationOptions) => void;
  NotificationComponent: React.FC;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const useNotification = (): NotificationHook => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<NotificationOptions | null>(null);

  const showNotification = useCallback((options: NotificationOptions) => {
    setOptions(options);
    setIsOpen(true);
  }, []);

  const closeNotification = useCallback(() => {
    setIsOpen(false);
  }, []);

  const success = useCallback((message: string, title = 'Success') => {
    showNotification({
      title,
      message,
      type: 'success',
    });
  }, [showNotification]);

  const error = useCallback((message: string, title = 'Error') => {
    showNotification({
      title,
      message,
      type: 'error',
    });
  }, [showNotification]);

  const warning = useCallback((message: string, title = 'Warning') => {
    showNotification({
      title,
      message,
      type: 'warning',
    });
  }, [showNotification]);

  const info = useCallback((message: string, title = 'Information') => {
    showNotification({
      title,
      message,
      type: 'info',
    });
  }, [showNotification]);

  const NotificationComponent = useCallback(() => {
    if (!options) return null;

    return (
      <NotificationModal
        isOpen={isOpen}
        onClose={closeNotification}
        title={options.title}
        message={options.message}
        type={options.type}
        buttonText={options.buttonText}
        autoDismiss={options.autoDismiss}
        dismissTimeout={options.dismissTimeout}
      />
    );
  }, [isOpen, closeNotification, options]);

  return {
    showNotification,
    NotificationComponent,
    success,
    error,
    warning,
    info,
  };
};

export default useNotification;

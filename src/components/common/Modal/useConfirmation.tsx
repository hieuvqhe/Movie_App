import { useState, useCallback } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { FiAlertTriangle, FiInfo, FiHelpCircle, FiTrash2 } from 'react-icons/fi';

type ConfirmationOptions = {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  iconType?: 'alert' | 'info' | 'help' | 'delete' | null;
  confirmButtonVariant?: 'primary' | 'secondary' | 'outline';
};

type ConfirmationHook = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  ConfirmationDialogComponent: React.FC;
};

const useConfirmation = (): ConfirmationHook => {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [resolve, setResolve] = useState<(value: boolean) => void>(() => () => {});
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);
    
    return new Promise<boolean>((res) => {
      setResolve(() => res);
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolve(false);
  }, [resolve]);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    resolve(true);
    setIsOpen(false);
    setIsLoading(false);
  }, [resolve]);

  const getIcon = (iconType: string | null) => {
    if (!iconType) return null;
    
    const icons = {
      alert: <FiAlertTriangle size={36} className="text-yellow-400" />,
      info: <FiInfo size={36} className="text-blue-400" />,
      help: <FiHelpCircle size={36} className="text-purple-400" />,
      delete: <FiTrash2 size={36} className="text-red-400" />,
    };
    
    return icons[iconType as keyof typeof icons] || null;
  };

  const ConfirmationDialogComponent = useCallback(() => {
    if (!options) return null;
    
    const icon = options.iconType ? getIcon(options.iconType) : null;

    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        confirmButtonVariant={options.confirmButtonVariant}
        icon={icon}
        isLoading={isLoading}
      />
    );
  }, [isOpen, handleCancel, handleConfirm, isLoading, options]);

  return { confirm, ConfirmationDialogComponent };
};

export default useConfirmation;

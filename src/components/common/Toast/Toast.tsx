import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for fade out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const iconMap = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiAlertCircle className="text-red-500" size={20} />,
    info: <FiAlertCircle className="text-blue-500" size={20} />
  };

  const bgColorMap = {
    success: 'bg-green-100 border-green-300',
    error: 'bg-red-100 border-red-300',
    info: 'bg-blue-100 border-blue-300'
  };
  
  const textColorMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  };

  return (
    <div 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        flex items-center max-w-md w-full px-4 py-3 rounded-lg
        shadow-lg border transition-all duration-300
        ${bgColorMap[type]}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div className="flex-shrink-0">
        {iconMap[type]}
      </div>
      <p className={`ml-3 mr-8 ${textColorMap[type]}`}>
        {message}
      </p>
      <button 
        onClick={onClose}
        className="ml-auto text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export default Toast;

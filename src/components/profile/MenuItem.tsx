import React, { ReactNode } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface MenuItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  description,
  icon,
  isOpen,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center py-4 px-1 border-b border-gray-700 focus:outline-none"
    >
      <div className="text-red-500 mr-4">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      {isOpen ? (
        <FiChevronUp className="text-gray-400" />
      ) : (
        <FiChevronDown className="text-gray-400" />
      )}
    </button>
  );
};

export default MenuItem;

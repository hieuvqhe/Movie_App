import React from 'react';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  className = '',
  children,
  onClick,
  hoverable = true,
}) => {
  return (
    <div
      className={`
        bg-gray-800 rounded-lg overflow-hidden shadow-lg 
        ${hoverable ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

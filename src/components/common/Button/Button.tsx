import React from 'react';
import Loader from '../Loader';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactElement;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...rest
}) => {
  // Base button classes with fancy effects
  let buttonClasses = `
    group relative overflow-hidden rounded-lg border
    font-bold text-left p-3 text-white transition-all duration-500
    hover:duration-500 hover:border-rose-300
    group-hover:before:duration-500 group-hover:after:duration-500
    before:absolute before:content-[''] before:rounded-full before:blur-lg before:z-10 before:transition-all before:duration-500
    after:absolute after:content-[''] after:rounded-full after:blur-lg after:z-10 after:transition-all after:duration-500
    hover:before:blur hover:underline hover:underline-offset-4 hover:decoration-2
    focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:border-current disabled:hover:before:blur-none
  `;

  // Size classes
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-14 text-base',
    lg: 'h-16 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: `
      bg-neutral-900 text-white-50 hover:text-blue-300
      before:w-12 before:h-12 before:right-1 before:top-1 before:bg-blue-500
      hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] hover:before:right-12 hover:before:-bottom-8
      after:w-20 after:h-20 after:bg-rose-300 after:right-8 after:top-3
      hover:after:-right-8
    `,
    secondary: `
      bg-neutral-900 text-white-50 hover:text-teal-300
      before:w-12 before:h-12 before:right-1 before:top-1 before:bg-blue-500
      hover:before:[box-shadow:_20px_20px_20px_30px_#1e40af] hover:before:right-12 hover:before:-bottom-8
      after:w-20 after:h-20 after:bg-teal-300 after:right-8 after:top-3
      hover:after:-right-8 hover:border-teal-300
    `,
    outline: `
      bg-transparent border-blue-500 text-violet-500 hover:text-rose-300
      before:w-12 before:h-12 before:right-1 before:top-1 before:bg-violet-500/30
      hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] hover:before:right-12 hover:before:-bottom-8
      after:w-20 after:h-20 after:bg-rose-300/30 after:right-8 after:top-3
      hover:after:-right-8 hover:bg-neutral-900/80 hover:border-rose-300
    `,
    icon: `
      bg-transparent border-blue-500 text-white-400 hover:text-white p-2
      before:w-6 before:h-6 before:right-0 before:top-0 before:bg-violet-500/0
      hover:before:[box-shadow:_10px_10px_10px_15px_#a21caf33] hover:before:right-6 hover:before:-bottom-4
      after:w-10 after:h-10 after:bg-rose-300/0 after:right-4 after:top-1
      hover:after:-right-4
    `,
  };

  // Icon button specific styling
  if (variant === 'icon') {
    buttonClasses += ' w-10 h-10 flex items-center justify-center';
  } else {
    buttonClasses += ` ${sizeClasses[size]} ${fullWidth ? 'w-full' : 'w-64'}`;
  }

  // Combine all classes
  buttonClasses += ` ${variantClasses[variant]} ${className}`;

  // Map button size to loader size
  const loaderSize = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  // For the loading state, we need to modify some styles to accommodate the loader
  if (isLoading) {
    buttonClasses = buttonClasses.replace('text-left', 'flex items-center justify-center');
  }

  return (
    <button 
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 scale-[0.35] origin-center inline-block relative">
            <Loader size={loaderSize[size]} />
          </div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className={`flex ${variant !== 'icon' ? 'items-start' : 'items-center justify-center'}`}>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {variant === 'icon' ? icon : children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </div>
      )}
    </button>
  );
};

export default Button;

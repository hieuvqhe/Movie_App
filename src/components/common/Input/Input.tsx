import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiSearch, FiX } from 'react-icons/fi';

export type InputVariant = 'text' | 'search' | 'password';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  variant = 'text',
  size = 'md',
  label,
  error,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  onClear,
  id,
  type,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine the input type
  let inputType = type;
  
  if (variant === 'password') {
    inputType = showPassword ? 'text' : 'password';
  } else if (variant === 'search') {
    inputType = 'text';
  } else if (!inputType) {
    inputType = 'text';
  }
  
  // Base classes for the input
  const baseInputClasses = `
    bg-zinc-200 text-zinc-600 font-mono
    ring-1 focus:ring-2 outline-none duration-300
    placeholder:text-zinc-600 placeholder:opacity-50 
    rounded-full shadow-md focus:shadow-lg
    ${error ? 'ring-red-400 focus:ring-red-500 focus:shadow-red-400' : 'ring-zinc-400 focus:ring-rose-400 focus:shadow-rose-400'}
  `;
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base',
  };
  
  // Padding adjustments for icons
  const leftPadding = leftIcon ? 'pl-10' : '';
  const rightPadding = (rightIcon || variant === 'password' || (variant === 'search' && rest.value)) ? 'pr-10' : '';
  
  const inputClasses = `
    ${baseInputClasses} 
    ${sizeClasses[size]} 
    ${leftPadding} 
    ${rightPadding}
    ${fullWidth ? 'w-full' : 'w-64'}
    ${className}
  `;
  
  return (
    <div 
      className={`relative ${fullWidth ? 'w-full' : ''} ${containerClassName}`}
    >
      {label && (
        <label 
          htmlFor={inputId}
          className={`block mb-1.5 font-medium text-sm ${error ? 'text-red-500' : 'text-gray-200'}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
            {leftIcon}
          </div>
        )}
        
        {/* Input Element */}
        <input
          id={inputId}
          type={inputType}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        
        {/* Right Icon or Password Toggle */}
        {variant === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
        
        {/* Clear button for search input */}
        {variant === 'search' && rest.value && onClear && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
            onClick={onClear}
            tabIndex={-1}
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
        
        {/* Custom Right Icon (when not password or search with value) */}
        {rightIcon && variant !== 'password' && !(variant === 'search' && rest.value && onClear) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

// Specialized input components
export const TextInput: React.FC<Omit<InputProps, 'variant'>> = (props) => (
  <Input variant="text" {...props} />
);

export const SearchInput: React.FC<Omit<InputProps, 'variant' | 'leftIcon'> & { onSearch?: (value: string) => void }> = ({ 
  onSearch, 
  onClear,
  ...props 
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && props.value) {
      onSearch(props.value.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={props.fullWidth ? 'w-full' : ''}>
      <Input 
        variant="search"
        leftIcon={<FiSearch />}
        onClear={onClear}
        {...props}
      />
    </form>
  );
};

export const PasswordInput: React.FC<Omit<InputProps, 'variant' | 'type'>> = (props) => (
  <Input variant="password" {...props} />
);

export default Input;

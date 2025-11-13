
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', isLoading = false, className = '', ...props }) => {
  // FIX: Removed padding and font size from base classes to be handled by size prop.
  const baseClasses = "rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-green-600 text-white focus:ring-secondary',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  // FIX: Added size classes for different button sizes.
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;

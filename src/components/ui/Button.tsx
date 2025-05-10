// src/components/ui/Button.tsx
import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { colors, theme } = useTheme();
  
  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: 'white',
          hoverBg: theme === 'light' ? '#2563EB' : '#3B82F6', // darker/lighter blue
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: 'white',
          hoverBg: theme === 'light' ? '#0E9F6E' : '#10B981', // darker/lighter green
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          hoverBg: theme === 'light' ? '#EFF6FF' : '#1E3A8A', // light blue / dark blue
          borderColor: colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444', // red-500
          color: 'white',
          hoverBg: '#DC2626', // red-600
          borderColor: 'transparent',
        };
      case 'success':
        return {
          backgroundColor: '#10B981', // emerald-500
          color: 'white',
          hoverBg: '#059669', // emerald-600
          borderColor: 'transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          hoverBg: theme === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.2)',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary,
          color: 'white',
          hoverBg: theme === 'light' ? '#2563EB' : '#3B82F6', // darker/lighter blue
          borderColor: 'transparent',
        };
    }
  };

  // Determine button size
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const buttonStyles = getButtonStyles();
  const sizeClasses = getButtonSize();
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        flex items-center justify-center font-medium rounded-md transition-colors duration-200
        ${sizeClasses}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-opacity-90'}
        ${className}
      `}
      disabled={isDisabled}
      style={{
        backgroundColor: buttonStyles.backgroundColor,
        color: buttonStyles.color,
        borderWidth: variant === 'outline' ? '1px' : '0',
        borderColor: buttonStyles.borderColor,
      }}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
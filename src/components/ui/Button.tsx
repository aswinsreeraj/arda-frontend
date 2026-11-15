import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  hotkey?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  hotkey,
  icon,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] select-none rounded disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-md min-h-[34px]',
    md: 'text-sm px-4 py-2 gap-2 rounded-md min-h-[40px]',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg min-h-[46px]',
  };

  const variantStyles = {
    primary:
      'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm hover:shadow-[0_0_12px_rgba(37,99,235,0.35)] border border-transparent font-medium',
    secondary:
      'bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1f1f1f] dark:hover:bg-[#282828] text-neutral-800 dark:text-gray-200 border border-neutral-300 dark:border-[#333333]',
    outline:
      'bg-transparent hover:bg-neutral-100 dark:hover:bg-[#282828] text-neutral-700 dark:text-gray-300 border border-neutral-300 dark:border-[#3e3e3e] hover:border-neutral-400 dark:hover:border-[#555555]',
    ghost:
      'bg-transparent hover:bg-neutral-100 dark:hover:bg-[#222222] text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white',
    danger:
      'bg-red-50 hover:bg-red-100 dark:bg-[#1f1f1f] dark:hover:bg-[#252525] border border-red-300 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700/70 text-red-600 dark:text-red-400',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-current"
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
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8v8H4z"
            fill="currentColor"
          />
        </svg>
      ) : (
        icon
      )}
      <span>{children}</span>
      {hotkey && (
        <span
          className={clsx(
            'px-1.5 py-0.5 rounded text-xs font-mono leading-none',
            variant === 'primary'
              ? 'bg-blue-700 text-blue-100'
              : 'bg-black/10 dark:bg-[#2a2a2a] text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-[#3a3a3a]'
          )}
        >
          {hotkey}
        </span>
      )}
    </button>
  );
};

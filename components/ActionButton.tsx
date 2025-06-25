
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`
        flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-medium rounded-md shadow-sm text-white 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-150 ease-in-out
        ${className}
      `}
    >
      {children}
    </button>
  );
};

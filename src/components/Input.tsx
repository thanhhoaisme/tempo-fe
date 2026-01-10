'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`px-4 py-3 rounded-xl bg-purple-50 dark:bg-[#1A1A2E] border-0 text-sm text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

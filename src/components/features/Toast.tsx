'use client';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertCircle className="text-yellow-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    warning: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className={`fixed top-20 right-4 z-40 flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[type]} shadow-lg animate-slide-in`}>
      {icons[type]}
      <span className="text-sm font-medium text-gray-900 dark:text-white">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
        <X size={16} />
      </button>
    </div>
  );
}

'use client';

type StatusType = 'Not started' | 'In progress' | 'Done' | 'Re-surface';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export default function StatusBadge({ status, size = 'md', onClick }: StatusBadgeProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'Done': return 'bg-green-600 dark:bg-green-600';
      case 'In progress': return 'bg-blue-600 dark:bg-blue-600';
      case 'Re-surface': return 'bg-yellow-600 dark:bg-yellow-600';
      default: return 'bg-gray-600 dark:bg-gray-600';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs';

  return (
    <span 
      onClick={onClick}
      className={`${getStatusColor(status)} ${sizeClasses} rounded-md font-medium inline-block text-white ${onClick ? 'cursor-pointer' : ''}`}
    >
      {status}
    </span>
  );
}

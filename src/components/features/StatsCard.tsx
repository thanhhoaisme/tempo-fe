'use client';

interface StatsCardProps {
  value: string | number;
  label: string;
  valueClassName?: string;
}

export default function StatsCard({ value, label, valueClassName = 'text-gray-900 dark:text-white' }: StatsCardProps) {
  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg">
      <div className={`text-2xl font-bold mb-1 ${valueClassName}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

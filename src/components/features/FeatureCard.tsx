'use client';

import React from 'react';

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function FeatureCard({ title, description, icon, onClick }: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 text-purple-600 dark:text-purple-400">{icon}</div>}
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
          {description && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
        </div>
      </div>
    </button>
  );
}

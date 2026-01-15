'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: number | string;
    subtitle: string;
    gradient: 'orange' | 'green' | 'purple' | 'blue';
}

const gradientClasses = {
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    blue: 'from-blue-500 to-indigo-600',
};

export default function StatCard({ icon: Icon, title, value, subtitle, gradient }: StatCardProps) {
    return (
        <div className={`bg-gradient-to-br ${gradientClasses[gradient]} rounded-2xl p-4 text-white shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon size={20} />
                <span className="text-sm font-medium opacity-90">{title}</span>
            </div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-xs opacity-75 mt-1">{subtitle}</div>
        </div>
    );
}

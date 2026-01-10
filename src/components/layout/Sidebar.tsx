'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TempoLogoText } from '../icons/TempoIcon';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Brain,
  MessageSquare,
  Timer,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ href, icon, label, active }: NavItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${active
      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
      : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-300'
      }`}
  >
    <div className="w-5 h-5">{icon}</div>
    <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  const mainNav = [
    { href: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { href: '/tracker', icon: <CheckSquare size={20} />, label: 'To-do' },
    { href: '/habits', icon: <Target size={20} />, label: 'Habits' },
    { href: '/timer', icon: <Timer size={20} />, label: 'Timer' },
    { href: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
    { href: '/shop', icon: <ShoppingBag size={20} />, label: 'Shop' },
  ];

  const aiNav = [
    { href: '/ai-analytics', icon: <Brain size={20} />, label: 'AI insights' },
    { href: '/ai-chat', icon: <MessageSquare size={20} />, label: 'AI Chatbot' },
  ];

  return (
    <aside className="w-56 h-screen bg-white dark:bg-[#1E1E38] flex flex-col shadow-sm border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-5 pb-6">
        <TempoLogoText />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-1">
        {mainNav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}

        <div className="my-2" />

        {aiNav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}

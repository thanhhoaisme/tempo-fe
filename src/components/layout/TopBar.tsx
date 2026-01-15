'use client';

import { Bell, User, Settings, LogOut, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    title: 'Task completed!',
    message: 'You finished "Build SQL" task',
    time: '2 min ago',
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Reminder',
    message: 'Don\'t forget to complete your IELTS practice',
    time: '15 min ago',
    read: false,
    type: 'reminder'
  },
  {
    id: '3',
    title: 'Streak warning!',
    message: 'Complete a task today to keep your streak',
    time: '1 hour ago',
    read: true,
    type: 'warning'
  },
  {
    id: '4',
    title: 'New habit created',
    message: 'Morning meditation added to your habits',
    time: '3 hours ago',
    read: true,
    type: 'info'
  },
  {
    id: '5',
    title: 'Timer session complete!',
    message: 'You completed a 25-minute focus session',
    time: '5 hours ago',
    read: true,
    type: 'success'
  },
];

export default function TopBar() {
  const { profile } = useApp();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'reminder': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-[#1A1A2E] flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700">
      {/* Search Bar - Center */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <SlidersHorizontal size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors relative"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#252540] rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                          }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(notification.type)}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 truncate">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">@leonard_b</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#252540] rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                {/* User Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">@johndoe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">John Doe</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">john.doe@example.com</p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors text-sm"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors text-sm"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>

                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={() => {
                      router.push('/login');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                  >
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

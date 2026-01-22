'use client';

import { Settings, Moon, Sun, Bell, Shield, Palette, Download } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        user: {
          id: 'user-001',
          name: 'Demo User',
          email: 'demo@flownote.app',
          avatarUrl: null,
          coins: 150,
          activeSkin: 'default'
        },
        tasks: [
          { id: 'task-1', title: 'Sample Task 1', status: 'in-progress', priority: 'high', createdAt: '2026-01-01T10:00:00Z' },
          { id: 'task-2', title: 'Sample Task 2', status: 'done', priority: 'medium', createdAt: '2026-01-02T14:30:00Z' }
        ],
        projects: [
          { id: 'proj-1', name: 'My Project', collapsed: false }
        ],
        notes: [
          { id: 'note-1', title: 'Sample Note', content: 'This is a sample note content.', createdAt: '2026-01-05T09:00:00Z' }
        ],
        habits: [
          { id: 'habit-1', title: 'Morning Exercise', schedule: 'daily', streak: 7, lastCompleted: '2026-01-09T07:00:00Z' }
        ],
        calendarEvents: [
          { id: 'event-1', title: 'Team Meeting', startTime: '2026-01-09T10:00:00Z', endTime: '2026-01-09T11:00:00Z', color: '#8B5CF6' }
        ],
        timerSessions: [
          { id: 'session-1', taskId: 'task-1', duration: 1500, startedAt: '2026-01-09T14:00:00Z' }
        ],
        settings: {
          theme: theme,
          emailNotifications: emailNotifications,
          timeFormat: '24h'
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `flownote-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="text-purple-600" size={28} />
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Palette size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize how Tempo looks</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-[#1A1A2E] rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun size={20} className="text-orange-500" />
                ) : (
                  <Moon size={20} className="text-purple-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === 'light' ? 'Light mode' : 'Dark mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${theme === 'dark' ? 'left-8' : 'left-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Bell size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-[#1A1A2E] rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive daily summary via email
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-14 h-7 rounded-full transition-colors ${emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${emailNotifications ? 'left-8' : 'left-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Security</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full p-4 bg-gray-50 dark:bg-[#1A1A2E] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#252540] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isExporting ? 'Preparing download...' : 'Download all your data'}
                </p>
              </div>
              <Download size={20} className={`text-gray-500 dark:text-gray-400 ${isExporting ? 'animate-pulse' : ''}`} />
            </button>
            <button className="w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-left hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-sm text-red-500 dark:text-red-400">Permanently delete your account</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

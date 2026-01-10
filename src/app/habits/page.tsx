'use client';

import { useApp } from '@/context/AppContext';
import { Target, Plus, Check, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Toast from '@/components/features/Toast';
import Modal from '@/components/features/Modal';
import EmptyState from '@/components/features/EmptyState';
import StatsCard from '@/components/features/StatsCard';

export default function HabitsPage() {
  const { habits, updateHabitCompletion } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    const isCompleted = habit?.completions?.[dateKey] || false;
    updateHabitCompletion(habitId, date, !isCompleted);
  };

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now().toString(),
        name: newHabitName,
        completions: {},
        createdAt: Date.now(),
      };
      
      // TODO: Add to AppContext
      setToast({ message: `Habit "${newHabitName}" added successfully!`, type: 'success' });
      
      setNewHabitName('');
      setShowAddModal(false);
    }
  };

  const handleEditHabit = () => {
    if (editingHabit && newHabitName.trim()) {
      // TODO: Update in AppContext
      setToast({ message: 'Habit updated successfully!', type: 'success' });
      
      setShowEditModal(false);
      setEditingHabit(null);
      setNewHabitName('');
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      // TODO: Delete from AppContext
      setToast({ message: 'Habit deleted successfully!', type: 'success' });
    }
  };

  const openEditModal = (habit: any) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setShowEditModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily habits</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </div>

      {/* Add/Edit Habit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          showAddModal ? setShowAddModal(false) : setShowEditModal(false);
          setNewHabitName('');
          setEditingHabit(null);
        }}
        title={showEditModal ? 'Edit Habit' : 'Add New Habit'}
      >
        {/* Habit Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Habit Name
          </label>
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="e.g., Morning Exercise"
            autoFocus
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              showAddModal ? setShowAddModal(false) : setShowEditModal(false);
              setNewHabitName('');
              setEditingHabit(null);
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={showEditModal ? handleEditHabit : handleAddHabit}
            disabled={!newHabitName.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl"
          >
            {showEditModal ? 'Save Changes' : 'Add Habit'}
          </button>
        </div>
      </Modal>

      {/* Habits Grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-9 gap-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <div className="col-span-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">Habit</div>
          {last7Days.map((date, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-400">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date.getDate()}</div>
            </div>
          ))}
          <div className="text-center font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</div>
        </div>

        {/* Habits */}
        {habits.length === 0 ? (
          <EmptyState
            icon={<Target size={48} />}
            title="No habits yet"
            description="Add one to get started!"
            action={{
              label: 'Add Habit',
              onClick: () => setShowAddModal(true)
            }}
          />
        ) : (
          habits.map(habit => {
            return (
              <div
                key={habit.id}
                className="grid grid-cols-9 gap-4 p-4 border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
              >
                <div className="col-span-1 flex items-center">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{habit.name}</span>
                </div>
                {last7Days.map((date, i) => {
                  const dateKey = date.toISOString().split('T')[0];
                  const isCompleted = habit.completions?.[dateKey] || false;
                  return (
                    <div key={i} className="flex items-center justify-center">
                      <button
                        onClick={() => toggleHabitCompletion(habit.id, date)}
                        className={`w-9 h-9 rounded-xl border-2 transition-all ${
                          isCompleted
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-purple-200 dark:border-purple-800 hover:border-purple-400'
                        }`}
                      >
                        {isCompleted && <Check size={18} className="mx-auto" />}
                      </button>
                    </div>
                  );
                })}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="Edit habit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      {habits.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <StatsCard
            value={habits.length}
            label="Total Habits"
          />
          <StatsCard
            value={habits.reduce((acc, h) => {
              const today = new Date().toISOString().split('T')[0];
              return acc + (h.completions?.[today] ? 1 : 0);
            }, 0)}
            label="Completed Today"
            valueClassName="text-purple-600"
          />
          <StatsCard
            value={`${Math.round(
              (habits.reduce((acc, h) => {
                const today = new Date().toISOString().split('T')[0];
                return acc + (h.completions?.[today] ? 1 : 0);
              }, 0) /
                habits.length) *
                100
            ) || 0}%`}
            label="Completion Rate"
            valueClassName="text-orange-500"
          />
        </div>
      )}
    </div>
  );
}

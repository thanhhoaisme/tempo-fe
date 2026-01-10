'use client';

import { useApp } from '@/context/AppContext';
import { AlertTriangle, Flame, CheckCircle2, Clock, ListTodo, Target, Calendar, ChevronRight, Gift, Coins } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';

interface HabitStreak {
  completed: number;
  missed: number;
  total: number;
  currentStreak: number;
}

interface TaskStats {
  total: number;
  done: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
}

type TimePeriod = 'week' | 'month';

export default function Home() {
  const { habits, profile, tasks, projects, claimedRewards, claimReward } = useApp();
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [streakStats, setStreakStats] = useState<HabitStreak>({
    completed: 0,
    missed: 0,
    total: 0,
    currentStreak: 0,
  });
  const [weeklyData, setWeeklyData] = useState<{ day: number; completed: number; missed: number }[]>([]);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // Streak milestone rewards
  const streakRewards = [
    { id: 'streak-7', days: 7, coins: 50, label: '1 Week' },
    { id: 'streak-14', days: 14, coins: 100, label: '2 Weeks' },
    { id: 'streak-28', days: 28, coins: 200, label: '4 Weeks' },
  ];

  // Calculate task statistics
  const taskStats: TaskStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return {
      total: tasks.length,
      done: tasks.filter(t => t.status === 'Done').length,
      inProgress: tasks.filter(t => t.status === 'In progress').length,
      notStarted: tasks.filter(t => t.status === 'Not started').length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'Done').length,
    };
  }, [tasks]);

  // Get upcoming tasks (due in next 7 days)
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return tasks
      .filter(t => t.dueDate && t.dueDate >= todayStr && t.dueDate <= nextWeekStr && t.status !== 'Done')
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 5);
  }, [tasks]);

  // Get today's habit completion
  const todayHabits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return habits.map(habit => ({
      ...habit,
      completedToday: habit.completions?.[today] || false,
    }));
  }, [habits]);

  const habitsCompletedToday = todayHabits.filter(h => h.completedToday).length;

  useEffect(() => {
    const days = timePeriod === 'week' ? 7 : 30;
    const today = new Date();
    const lastNDays = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    let completed = 0;
    let missed = 0;
    let currentStreak = 0;
    let streakBroken = false;

    lastNDays.reverse().forEach((dateKey) => {
      let dayCompleted = 0;
      let dayTotal = habits.length;

      habits.forEach((habit: any) => {
        if (habit.completions && habit.completions[dateKey]) {
          dayCompleted++;
        }
      });

      if (dayCompleted === dayTotal && dayTotal > 0) {
        completed++;
        if (!streakBroken) currentStreak++;
      } else if (dayTotal > 0) {
        missed++;
        streakBroken = true;
      }
    });

    setStreakStats({
      completed,
      missed,
      total: completed + missed,
      currentStreak,
    });

    // Generate chart data
    const chartDays = timePeriod === 'week' ? 7 : 15;
    const lastChartDays = Array.from({ length: chartDays }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (chartDays - 1 - i));
      return d;
    });

    const data = lastChartDays.map((date) => {
      const dateKey = date.toISOString().split('T')[0];
      let dayCompleted = 0;
      let dayMissed = 0;

      habits.forEach((habit: any) => {
        if (habit.completions && habit.completions[dateKey]) {
          dayCompleted++;
        } else {
          dayMissed++;
        }
      });

      return {
        day: date.getDate(),
        completed: habits.length > 0 ? (dayCompleted / habits.length) * 100 : 0,
        missed: habits.length > 0 ? (dayMissed / habits.length) * 100 : 0,
      };
    });

    setWeeklyData(data);
  }, [habits, timePeriod]);

  const completionPercentage = streakStats.total > 0
    ? Math.round((streakStats.completed / streakStats.total) * 100)
    : 0;
  const missedPercentage = streakStats.total > 0
    ? Math.round((streakStats.missed / streakStats.total) * 100)
    : 0;

  const isLosingStreak = streakStats.currentStreak === 0 && streakStats.total > 0;

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done': return 'text-green-500';
      case 'In progress': return 'text-blue-500';
      case 'Re-surface': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleClaimReward = (rewardId: string, coins: number, label: string) => {
    const success = claimReward(rewardId, coins);
    if (success) {
      setRewardMessage(`🎉 Claimed ${coins} coins for ${label} streak!`);
      setTimeout(() => setRewardMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
          className="text-xs bg-purple-50 dark:bg-[#1A1A2E] border-0 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 font-medium cursor-pointer"
        >
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      {isLosingStreak && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-orange-500" size={20} />
          <p className="text-orange-700 dark:text-orange-400 font-medium text-sm">
            You're losing streaks - complete your habits today!
          </p>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} />
            <span className="text-sm font-medium opacity-90">Current Streak</span>
          </div>
          <div className="text-3xl font-bold">{streakStats.currentStreak}</div>
          <div className="text-xs opacity-75 mt-1">days</div>
        </div>

        {/* Tasks Done Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium opacity-90">Tasks Done</span>
          </div>
          <div className="text-3xl font-bold">{taskStats.done}</div>
          <div className="text-xs opacity-75 mt-1">of {taskStats.total} total</div>
        </div>

        {/* Habits Today Card */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} />
            <span className="text-sm font-medium opacity-90">Habits Today</span>
          </div>
          <div className="text-3xl font-bold">{habitsCompletedToday}</div>
          <div className="text-xs opacity-75 mt-1">of {habits.length} completed</div>
        </div>

        {/* In Progress Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} />
            <span className="text-sm font-medium opacity-90">In Progress</span>
          </div>
          <div className="text-3xl font-bold">{taskStats.inProgress}</div>
          <div className="text-xs opacity-75 mt-1">tasks active</div>
        </div>
      </div>

      {/* Reward notification */}
      {rewardMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Coins size={20} />
            <span className="font-medium">{rewardMessage}</span>
          </div>
        </div>
      )}

      {/* Streak Rewards */}
      {streakStats.currentStreak >= 7 && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift size={18} className="text-yellow-500" />
              Streak Rewards
            </h2>
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <Coins size={16} />
              <span className="font-semibold">{profile.coins} coins</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {streakRewards.map((reward) => {
              const isClaimed = claimedRewards.includes(reward.id);
              const canClaim = streakStats.currentStreak >= reward.days && !isClaimed;
              const isLocked = streakStats.currentStreak < reward.days;

              return (
                <button
                  key={reward.id}
                  onClick={() => canClaim && handleClaimReward(reward.id, reward.coins, reward.label)}
                  disabled={!canClaim}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isClaimed
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                      : canClaim
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-white cursor-pointer shadow-lg hover:scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isClaimed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Gift size={16} />
                  )}
                  <span className="font-medium">{reward.label}</span>
                  <span className={`text-sm ${isClaimed ? 'line-through' : ''}`}>
                    +{reward.coins}
                  </span>
                  {isLocked && (
                    <span className="text-xs opacity-75">({reward.days - streakStats.currentStreak} days left)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Streak & Habits */}
        <div className="space-y-6">
          {/* Streak Statistics */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                Habit Streaks
              </h2>
              <button
                onClick={() => router.push('/habits')}
                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex items-center justify-center mb-6">
              {/* Circular progress */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-purple-100 dark:text-purple-900/30"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${completionPercentage * 3.52} 352`}
                    strokeLinecap="round"
                    className="text-purple-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completionPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">completed</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{completionPercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Missed</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{missedPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Today's Habits */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-purple-500" />
                Today's Habits
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {habitsCompletedToday}/{habits.length}
              </span>
            </div>

            <div className="space-y-3">
              {todayHabits.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No habits yet. Add some in the Habits page!
                </p>
              ) : (
                todayHabits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => router.push('/habits')}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.02] ${habit.completedToday
                      ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span className={`flex-1 text-sm ${habit.completedToday
                      ? 'text-green-700 dark:text-green-400 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {habit.name}
                    </span>
                    {habit.completedToday && (
                      <CheckCircle2 size={18} className="text-green-500" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div className="space-y-6">
          {/* Tasks Overview */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ListTodo size={18} className="text-blue-500" />
                Tasks Overview
              </h2>
              <button
                onClick={() => router.push('/tracker')}
                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Status breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Not Started</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.notStarted}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">In Progress</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.inProgress}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Done</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{taskStats.done}</div>
                </div>
                <div className={`rounded-xl p-3 ${taskStats.overdue > 0
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${taskStats.overdue > 0 ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Overdue</span>
                  </div>
                  <div className={`text-xl font-bold ${taskStats.overdue > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                    }`}>{taskStats.overdue}</div>
                </div>
              </div>

              {/* Progress bar */}
              {taskStats.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((taskStats.done / taskStats.total) * 100)}% complete</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(taskStats.done / taskStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" />
                Upcoming Deadlines
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Next 7 days
              </span>
            </div>

            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming deadlines. Great job staying on top of things!
                </p>
              ) : (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => router.push('/tracker')}
                  >
                    <div className={`w-1.5 h-8 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      <p className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {formatDueDate(task.dueDate!)}
                      </p>
                      {task.projectId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {projects.find(p => p.id === task.projectId)?.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

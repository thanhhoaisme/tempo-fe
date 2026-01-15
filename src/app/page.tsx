'use client';

import { useApp } from '@/context/AppContext';
import { Flame, CheckCircle2, Clock, Target, Calendar, ChevronRight, Activity, Lock, Trophy, Star, Gift, Coins, Plus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/dashboard/StatCard';

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

interface Quote {
  q: string;
  a: string;
  h: string;
}

type TimePeriod = 'week' | 'month';

// Category colors mapping
const categoryColors: Record<string, string> = {
  'Health': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Learning': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Fitness': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Wellness': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Work': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Personal': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function Home() {
  const { habits, profile, tasks, calendarEvents, updateHabitCompletion, claimedRewards, claimReward } = useApp();
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [streakStats, setStreakStats] = useState<HabitStreak>({
    completed: 0,
    missed: 0,
    total: 0,
    currentStreak: 0,
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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

  // Get today's habit completion
  const todayHabits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return habits.map(habit => ({
      ...habit,
      completedToday: habit.completions?.[today] || false,
    }));
  }, [habits]);

  const habitsCompletedToday = todayHabits.filter(h => h.completedToday).length;

  // Generate recent activities from calendar events and timer sessions
  const recentActivities = useMemo(() => {
    const activities: { id: string; text: string; time: string; type: 'timer' | 'calendar' | 'habit' }[] = [];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Get today's calendar events (most recent first)
    const todayEvents = calendarEvents
      .filter(event => {
        const eventStart = new Date(event.startTime);
        return eventStart >= todayStart && eventStart <= now;
      })
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 6);

    todayEvents.forEach((event) => {
      const eventTime = new Date(event.startTime);
      const diffMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));
      let timeStr = '';

      if (diffMinutes < 60) {
        timeStr = `${diffMinutes} min ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      }

      activities.push({
        id: event.id,
        text: event.title,
        time: timeStr,
        type: event.createdFromTimer ? 'timer' : 'calendar',
      });
    });

    return activities;
  }, [calendarEvents]);

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
  }, [habits, timePeriod]);

  // Mock Quote of the Day (static data)
  useEffect(() => {
    const mockQuotes = [
      { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
      { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
      { q: "Success is not final, failure is not fatal.", a: "Winston Churchill" },
      { q: "The future belongs to those who believe in their dreams.", a: "Eleanor Roosevelt" },
      { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
      { q: "Everything you've ever wanted is on the other side of fear.", a: "George Addair" },
      { q: "Believe in yourself. You are braver than you think.", a: "Unknown" },
      { q: "I never dreamed about success, I worked for it.", a: "Estée Lauder" },
      { q: "Small progress is still progress.", a: "Unknown" },
      { q: "Do what you can with all you have, wherever you are.", a: "Theodore Roosevelt" },
    ];

    // Pick a random quote (no API call, pure mock data)
    const randomQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
    setQuote({
      q: randomQuote.q,
      a: randomQuote.a,
      h: ''
    });
    setQuoteLoading(false);
  }, []);

  // Toggle habit completion
  const toggleHabitToday = (habitId: string) => {
    const today = new Date();
    const habit = habits.find(h => h.id === habitId);
    const todayKey = today.toISOString().split('T')[0];
    const isCompleted = habit?.completions?.[todayKey] || false;
    updateHabitCompletion(habitId, today, !isCompleted);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting Header */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          👋 {getGreeting()}, {profile.username || 'User'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-10">
          Let's make today count. You've got {habits.length} habits scheduled.
        </p>
      </div>

      {/* Main Grid - 5/8 Left (2.5/4), 3/8 Right (1.5/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Left Column - 5/8 (2.5/4) */}
        <div className="lg:col-span-5 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Your Habits Today Card - Redesigned like image 2 */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Habits Today</h2>
              <button
                onClick={() => router.push('/habits')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                New Habit
              </button>
            </div>

            {/* Habits List */}
            <div className="space-y-1">
              {todayHabits.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No habits yet. Add some to get started!
                </p>
              ) : (
                todayHabits.map((habit, index) => {
                  const categoryClass = categoryColors[habit.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                  const isLastCompleted = habit.completedToday && index === todayHabits.length - 1;

                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${habit.completedToday
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50'
                        }`}
                    >
                      <div className="flex-1">
                        {/* Habit Name & Category */}
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {habit.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryClass}`}>
                            {habit.category || 'General'}
                          </span>
                        </div>
                        {/* Meta info */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>Daily</span>
                          <span>·</span>
                          <span>{habit.reminderTime || '8:00 AM'}</span>
                          <span>·</span>
                          <span className={habit.completedToday ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                            {habit.completedToday ? 'Complete ✓' : 'Not yet'}
                          </span>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${habit.completedToday
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                          }`}
                      >
                        {habit.completedToday && <CheckCircle2 size={18} />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Deadlines - Moved to left */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" />
                Upcoming Deadlines
              </h2>
              <button
                onClick={() => router.push('/tracker')}
                className="text-xs text-blue-500 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.dueDate && t.status !== 'Done').slice(0, 4).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming deadlines!
                </p>
              ) : (
                tasks.filter(t => t.dueDate && t.status !== 'Done').slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => router.push('/tracker')}
                  >
                    <div className={`w-1.5 h-8 rounded-full ${task.priority === 'High' ? 'bg-red-500' :
                      task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">{task.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity - Moved to left */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Recent Activity
              </h2>
              <button
                onClick={() => router.push('/calendar')}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                View calendar
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No recent activities. Start a focus timer or add events to your calendar!
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.slice(0, 4).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.type === 'timer' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{activity.text}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 3/8 (1.5/4) */}
        <div className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Quote of the Day Card */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {quoteLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : quote ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm">💭</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quote of the Day</h3>
                </div>
                <blockquote className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 italic">
                  "{quote.q}"
                </blockquote>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">— {quote.a}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load quote</p>
            )}
          </div>

          {/* Statistics Card - Stacked vertically */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h2>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Flame}
                title="Current Streak"
                value={streakStats.currentStreak}
                subtitle="days"
                gradient="orange"
              />
              <StatCard
                icon={CheckCircle2}
                title="Tasks Done"
                value={taskStats.done}
                subtitle={`of ${taskStats.total} total`}
                gradient="green"
              />
              <StatCard
                icon={Target}
                title="Habits Today"
                value={habitsCompletedToday}
                subtitle={`of ${habits.length} completed`}
                gradient="purple"
              />
              <StatCard
                icon={Clock}
                title="In Progress"
                value={taskStats.inProgress}
                subtitle="tasks active"
                gradient="blue"
              />
            </div>
          </div>

          {/* Streak Rewards Card */}
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streak Rewards</h2>

            {/* Reward Icons */}
            <div className="flex justify-center gap-4 mb-4">
              {[
                { id: 'streak-7', days: 7, coins: 50, label: '7 Days', icon: Trophy },
                { id: 'streak-14', days: 14, coins: 100, label: '14 Days', icon: Star },
                { id: 'streak-28', days: 28, coins: 200, label: '28 Days', icon: Gift },
              ].map((reward) => {
                const isClaimed = claimedRewards.includes(reward.id);
                const canClaim = streakStats.currentStreak >= reward.days && !isClaimed;
                const isLocked = streakStats.currentStreak < reward.days;
                const IconComponent = reward.icon;

                return (
                  <div key={reward.id} className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-1 rounded-full flex items-center justify-center border-2 ${isClaimed
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                      : canClaim
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}>
                      {isLocked ? (
                        <Lock size={16} className="text-gray-400" />
                      ) : isClaimed ? (
                        <CheckCircle2 size={16} className="text-blue-500" />
                      ) : (
                        <IconComponent size={16} className="text-white" />
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{reward.label}</div>
                    {isClaimed && (
                      <div className="text-xs text-blue-500">Claimed</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Claim Button */}
            {(() => {
              const streakRewards = [
                { id: 'streak-7', days: 7, coins: 50 },
                { id: 'streak-14', days: 14, coins: 100 },
                { id: 'streak-28', days: 28, coins: 200 },
              ];
              const nextClaimable = streakRewards.find(r =>
                streakStats.currentStreak >= r.days && !claimedRewards.includes(r.id)
              );

              if (nextClaimable) {
                return (
                  <button
                    onClick={() => claimReward(nextClaimable.id, nextClaimable.coins)}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Coins size={16} />
                    Claim {nextClaimable.coins} Coins
                  </button>
                );
              } else {
                return (
                  <button
                    disabled
                    className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-400 font-medium rounded-xl cursor-not-allowed text-sm"
                  >
                    {claimedRewards.length >= 3 ? 'All Rewards Claimed!' : 'Keep Going!'}
                  </button>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

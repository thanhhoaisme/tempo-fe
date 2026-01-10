'use client';

import { Brain, TrendingUp, Zap, Calendar, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AIAnalyticsPage() {
  const router = useRouter();
  
  const insights = [
    {
      id: '1',
      type: 'productivity',
      title: 'Peak Productivity Hours',
      description: 'You are most productive between 9 AM and 11 AM. Consider scheduling important tasks during this time.',
      confidence: 85,
      icon: <TrendingUp className="text-violet-500" />,
    },
    {
      id: '2',
      type: 'habit',
      title: 'Habit Consistency Improving',
      description: 'Your habit completion rate has increased by 23% this week. Keep up the good work!',
      confidence: 92,
      icon: <Zap className="text-green-500" />,
    },
    {
      id: '3',
      type: 'pattern',
      title: 'Weekly Pattern Detected',
      description: 'You tend to miss habits on Wednesdays. Try setting a reminder or reducing your Wednesday commitments.',
      confidence: 78,
      icon: <Calendar className="text-orange-500" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
          <Brain className="text-purple-600" size={28} />
          AI Insights
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personalized insights based on your productivity patterns
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl text-white shadow-lg">
          <div className="text-3xl font-bold mb-1">87%</div>
          <div className="text-sm opacity-90">Productivity Score</div>
        </div>
        <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg">
          <div className="text-3xl font-bold mb-1">12</div>
          <div className="text-sm opacity-90">Habits Tracked</div>
        </div>
        <div className="p-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg">
          <div className="text-3xl font-bold mb-1">5</div>
          <div className="text-sm opacity-90">Day Streak</div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Insights</h2>
        {insights.map(insight => (
          <div
            key={insight.id}
            className="p-5 bg-white dark:bg-[#252540] rounded-2xl hover:shadow-lg transition-all shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat CTA */}
      <div className="mt-8 p-8 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 rounded-2xl text-center">
        <MessageSquare size={40} className="mx-auto mb-4 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Want more personalized insights?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Chat with our AI assistant to get deeper analysis of your productivity patterns
        </p>
        <button 
          onClick={() => router.push('/ai-chat')}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          Start AI Chat
        </button>
      </div>
    </div>
  );
}

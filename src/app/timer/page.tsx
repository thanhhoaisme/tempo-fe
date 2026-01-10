'use client';

import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import Toast from '@/components/features/Toast';
import BatterySkin from '@/components/features/timer-skins/BatterySkin';
import ClockSkin from '@/components/features/timer-skins/ClockSkin';
import HPBarSkin from '@/components/features/timer-skins/HPBarSkin';
import CatYarnSkin from '@/components/features/timer-skins/CatYarnSkin';

export default function TimerPage() {
  const { addCalendarEvent, activeSkin } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [focusTopic, setFocusTopic] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const durations = [
    { label: '15 min', value: 15 },
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Separate effect to handle session completion
  useEffect(() => {
    if (timeLeft === 0 && sessionStartTime) {
      handleSessionComplete();
    }
  }, [timeLeft, sessionStartTime]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    // Create calendar event
    if (sessionStartTime && focusTopic.trim()) {
      const endTime = Date.now();
      addCalendarEvent({
        id: `event-${Date.now()}`,
        title: focusTopic.trim(),
        startTime: sessionStartTime,
        endTime: endTime,
        color: '#3d7a7a',
        createdFromTimer: true,
      });
      setToast({ message: `Session "${focusTopic}" completed and added to calendar!`, type: 'success' });
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: `Your ${selectedDuration} minute focus session is complete!`,
      });
    }

    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!focusTopic.trim()) {
      setToast({ message: 'Please enter a task name before starting', type: 'warning' });
      return;
    }

    if (!isRunning && !sessionStartTime) {
      setSessionStartTime(Date.now());
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setSessionStartTime(null);
  };

  const handleDurationChange = (duration: number) => {
    if (isRunning) return;
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setSessionStartTime(null);
  };

  const handleFinishEarly = () => {
    if (sessionStartTime && focusTopic.trim()) {
      const endTime = Date.now();
      addCalendarEvent({
        id: `event-${Date.now()}`,
        title: focusTopic.trim(),
        startTime: sessionStartTime,
        endTime: endTime,
        color: '#3d7a7a',
        createdFromTimer: true,
      });
      setToast({ message: `Session "${focusTopic}" saved to calendar!`, type: 'success' });
    }
    handleReset();
  };

  // Calculate coffee level (100% = full, 0% = empty)
  const totalDuration = selectedDuration * 60;
  const coffeeLevel = (timeLeft / totalDuration) * 100;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Focus Timer
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stay focused with Pomodoro technique</p>
        </div>

        {/* Task Input - Required before starting */}
        <div className={`mb-6 bg-white dark:bg-[#252540] rounded-2xl p-5 shadow-sm transition-all duration-300 ${!focusTopic.trim() && sessionStartTime === null ? 'ring-2 ring-amber-500/50 animate-pulse' : ''}`}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            What are you working on? <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            placeholder="e.g., Leetcode Practice, Study React, Work project..."
            disabled={isRunning}
            className={`w-full px-4 py-3 bg-purple-50 dark:bg-[#1A1A2E] border-2 transition-all focus:border-purple-500 rounded-xl focus:outline-none dark:text-white text-sm disabled:opacity-50 ${!focusTopic.trim() ? 'border-amber-500/50' : 'border-transparent'}`}
          />
          {!focusTopic.trim() && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold animate-bounce">
              ⚠️ Task name is required to start the timer
            </p>
          )}
        </div>

        {/* Timer Display with Skin */}
        <div className="bg-white dark:bg-[#252540] rounded-2xl p-10 text-center shadow-sm">
          <div className="relative w-72 h-72 mx-auto mb-8">
            {/* Render selected timer skin or default coffee mug */}
            {activeSkin === 'battery' ? (
              <BatterySkin percentage={coffeeLevel} isCharging={isRunning} />
            ) : activeSkin === 'clock' ? (
              <ClockSkin percentage={coffeeLevel} timeString={formatTime(timeLeft)} />
            ) : activeSkin === 'hp-bar' ? (
              <HPBarSkin percentage={coffeeLevel} />
            ) : activeSkin === 'cat-yarn' ? (
              <CatYarnSkin percentage={coffeeLevel} />
            ) : (
              /* Default Coffee Mug */
              <svg width="288" height="288" viewBox="0 0 200 200" className="mx-auto">{/* Mug Body Outline */}
              <path
                d="M 45 50 L 45 150 Q 45 170 65 170 L 135 170 Q 155 170 155 150 L 155 50 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 dark:text-gray-500"
              />

              {/* Coffee Liquid - Drains based on timer */}
              <defs>
                <clipPath id="mugClip">
                  <path d="M 45 50 L 45 150 Q 45 170 65 170 L 135 170 Q 155 170 155 150 L 155 50 Z" />
                </clipPath>
                <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B4513" />
                  <stop offset="100%" stopColor="#5D2E0C" />
                </linearGradient>
              </defs>

              <g clipPath="url(#mugClip)">
                {/* Coffee fill - height based on remaining time */}
                <rect
                  x="45"
                  y={170 - (120 * coffeeLevel / 100)}
                  width="110"
                  height={120 * coffeeLevel / 100}
                  fill="url(#coffeeGradient)"
                  className="transition-all duration-1000"
                />

                {/* Coffee surface shine */}
                <ellipse
                  cx="100"
                  cy={170 - (120 * coffeeLevel / 100)}
                  rx="50"
                  ry="8"
                  fill="#A0522D"
                  opacity="0.7"
                  className="transition-all duration-1000"
                />

                {/* Steam when coffee is hot (when time > 50%) */}
                {coffeeLevel > 50 && (
                  <>
                    <path
                      d="M 80 45 Q 75 30 80 20"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                      className="animate-pulse"
                    />
                    <path
                      d="M 100 42 Q 95 25 100 12"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.5"
                      className="animate-pulse"
                    />
                    <path
                      d="M 120 45 Q 125 30 120 20"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                      className="animate-pulse"
                    />
                  </>
                )}
              </g>

              {/* Mug Handle */}
              <path
                d="M 155 70 Q 185 70 185 100 Q 185 130 155 130"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 dark:text-gray-500"
              />

              {/* Inner shadow for depth */}
              <path
                d="M 45 50 L 45 150 Q 45 170 65 170 L 135 170 Q 155 170 155 150 L 155 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.2"
                className="text-gray-900 dark:text-gray-100"
              />
            </svg>
            )}

            {/* Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="138"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-800"
              />
              <circle
                cx="144"
                cy="144"
                r="138"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${progress * 8.67} 867`}
                className="text-amber-500 transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Time Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2 font-mono tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Focus Mode Active • {focusTopic}
                </span>
              ) : timeLeft === 0 ? (
                '🎉 Session Complete!'
              ) : sessionStartTime ? (
                'Paused'
              ) : (
                'Ready to Focus'
              )}
            </div>
          </div>

          {/* Controls - Reset | Start | Pause */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="p-4 bg-gray-100 dark:bg-[#1A1A2E] hover:bg-gray-200 dark:hover:bg-[#2a2a4a] rounded-xl transition-all hover:scale-105"
              title="Reset"
            >
              <RotateCcw size={24} className="text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleStart}
              disabled={isRunning || !focusTopic.trim()}
              className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-2xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Start"
            >
              <Play size={32} className="text-white ml-1" />
            </button>

            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Pause"
            >
              <Pause size={24} className="text-white" />
            </button>
          </div>

          {/* Finish Early Button */}
          {sessionStartTime && (
            <button
              onClick={handleFinishEarly}
              className="mt-4 px-6 py-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline transition-colors"
            >
              Finish & Save to Calendar
            </button>
          )}
        </div>

        {/* Duration Options */}
        <div className="mt-6 bg-white dark:bg-[#252540] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Duration</h3>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => {
                  handleDurationChange(duration.value);
                  setToast({ message: `Timer set to ${duration.value} minutes`, type: 'success' });
                  // Auto-dismiss toast after 3 seconds
                  setTimeout(() => {
                    setToast(null);
                  }, 3000);
                }}
                disabled={isRunning}
                className={`p-3 rounded-xl font-medium transition-all text-sm ${selectedDuration === duration.value
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-[#1A1A2E] text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {duration.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Custom minutes"
              disabled={isRunning}
              min="1"
              max="120"
              className="flex-1 px-4 py-2.5 bg-amber-50 dark:bg-[#1A1A2E] border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white disabled:opacity-50 text-sm"
            />
            <button
              onClick={() => {
                const mins = parseInt(customMinutes);
                if (mins > 0 && mins <= 120) {
                  handleDurationChange(mins);
                  setCustomMinutes('');
                  setToast({ message: `Timer set to ${mins} minutes`, type: 'success' });
                  // Auto-dismiss toast after 3 seconds
                  setTimeout(() => {
                    setToast(null);
                  }, 3000);
                } else {
                  setToast({ message: 'Please enter a valid time between 1-120 minutes', type: 'warning' });
                  setTimeout(() => {
                    setToast(null);
                  }, 3000);
                }
              }}
              disabled={isRunning || !customMinutes}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm"
            >
              Set
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-[#252540] rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sessions Today</div>
          </div>
          <div className="p-4 bg-white dark:bg-[#252540] rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-amber-600 mb-1">0h</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Focus Time</div>
          </div>
          <div className="p-4 bg-white dark:bg-[#252540] rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-orange-500 mb-1">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
          </div>
        </div>
      </div>
    </>
  );
}

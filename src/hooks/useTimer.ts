import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { TimerSession } from '@/types';

export function useTimer(initialDuration: number = 1500) {
  const { currentSession, setCurrentSession, timerRunning, setTimerRunning } = useApp();
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flownote_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('flownote_sessions', JSON.stringify(sessions));
    }
  }, [sessions, mounted]);

  // Timer tick effect
  useEffect(() => {
    if (!timerRunning || !currentSession) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer completed
          const completed: TimerSession = {
            ...currentSession,
            status: 'completed',
            completedAt: Date.now(),
          };
          setSessions(prev => [...prev, completed]);
          setCurrentSession(null);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, currentSession, setCurrentSession, setTimerRunning]);

  const startSession = useCallback((duration: number, topic: string) => {
    const session: TimerSession = {
      id: `session-${Date.now()}`,
      duration,
      focusTopic: topic,
      startedAt: Date.now(),
      status: 'active',
    };
    setCurrentSession(session);
    setTimeLeft(duration);
    setTimerRunning(true);
  }, [setCurrentSession, setTimerRunning]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
  }, [setTimerRunning]);

  const resumeTimer = useCallback(() => {
    setTimerRunning(true);
  }, [setTimerRunning]);

  const stopTimer = useCallback(() => {
    if (currentSession) {
      setSessions(prev =>
        prev.map(s =>
          s.id === currentSession.id
            ? { ...s, status: 'abandoned' as const }
            : s
        )
      );
    }
    setCurrentSession(null);
    setTimerRunning(false);
    setTimeLeft(initialDuration);
  }, [currentSession, setCurrentSession, setTimerRunning, initialDuration]);

  const getCompletedSessions = useCallback(() => {
    return sessions.filter(s => s.status === 'completed');
  }, [sessions]);

  const getTotalFocusTime = useCallback(() => {
    return getCompletedSessions().reduce((total, session) => total + session.duration, 0);
  }, [getCompletedSessions]);

  // Add newly completed session to the list
  useEffect(() => {
    setSessions(prev => [...prev.slice(-4), {
      id: `session-${Date.now()}`,
      duration: timeLeft === 0 ? initialDuration : 0,
      focusTopic: 'Focus Session',
      startedAt: Date.now(),
      completedAt: timeLeft === 0 ? Date.now() : undefined,
      status: timeLeft === 0 ? 'completed' : 'active',
    }]);
  }, [timeLeft, initialDuration]);

  return {
    timeLeft,
    setTimeLeft,
    currentSession,
    timerRunning,
    sessions,
    startSession,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getCompletedSessions,
    getTotalFocusTime,
  };
}

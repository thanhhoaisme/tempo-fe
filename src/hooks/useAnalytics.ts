import { useMemo } from 'react';
import { useTimer } from './useTimer';
import { useNotes } from '@/context/NotesContext';
import { useTracker } from '@/context/TrackerContext';
import { AnalyticsStat, MoodLevel } from '@/types';

export function useAnalytics() {
  const { getCompletedSessions, getTotalFocusTime } = useTimer();
  const { notes } = useNotes();
  const { entries } = useTracker();

  const stats = useMemo<AnalyticsStat>(() => {
    const completedSessions = getCompletedSessions();
    const totalFocusTime = getTotalFocusTime();
    const totalSessions = completedSessions.length;
    const avgSessionLength = totalSessions > 0 ? totalFocusTime / totalSessions : 0;

    // Calculate streaks
    const now = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasSessionToday = completedSessions.some(
        s => s.completedAt && s.completedAt >= dayStart.getTime() && s.completedAt <= dayEnd.getTime()
      );

      if (hasSessionToday) {
        if (i === 0) currentStreak = 1;
        tempStreak++;
      } else if (i > 0) {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Get mood analytics
    const moodEntries = entries.filter(e => e.category === 'mood');
    const moodCounts: Record<string, number> = {};
    moodEntries.forEach(entry => {
      moodCounts[entry.value] = (moodCounts[entry.value] || 0) + 1;
    });
    const topMood = (
      Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
    ) as MoodLevel;

    // Get hobby data
    const hobbyEntries = entries.filter(e => e.category === 'hobby');
    const hobbyCounts: Record<string, number> = {};
    hobbyEntries.forEach(entry => {
      hobbyCounts[entry.value] = (hobbyCounts[entry.value] || 0) + 1;
    });
    const commonHobbies = Object.entries(hobbyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hobby]) => hobby);

    return {
      totalFocusTime,
      totalSessions,
      averageSessionLength: avgSessionLength,
      longestStreak,
      currentStreak,
      notesCreated: notes.length,
      topMood,
      commonHobbies,
    };
  }, [getCompletedSessions, getTotalFocusTime, notes, entries]);

  return stats;
}

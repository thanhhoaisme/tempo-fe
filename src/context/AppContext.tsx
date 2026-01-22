'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TimerSession, Note, JournalEntry, CalendarEvent, Task, Project } from '@/types';

interface AppContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  currentSession: TimerSession | null;
  setCurrentSession: (session: TimerSession | null) => void;
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  habits: any[];
  addHabit: (habit: any) => void;
  updateHabit: (id: string, updates: any) => void;
  deleteHabit: (id: string) => void;
  updateHabitCompletion: (habitId: string, date: Date, completed: boolean) => void;
  tasks: Task[];
  projects: Project[];
  setTasks: (tasks: Task[]) => void;
  setProjects: (projects: Project[]) => void;
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  ownedSkins: string[];
  activeSkin: string | null;
  purchaseSkin: (skinId: string, price: number) => void;
  purchaseItem: (itemId: string, price: number) => void;
  activateSkin: (skinId: string) => void;
  // Streak rewards
  earnCoins: (amount: number) => void;
  claimedRewards: string[];
  claimReward: (rewardId: string, amount: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    coins: 1000,
    totalXP: 2500,
    level: 12,
    theme: 'light',
    timerAnimation: 'coffee',
    inventory: {},
    currentStreak: 8, // MOCK: Set to 8 days for testing streak rewards
    lastActiveDate: '',
  });

  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Initial habits with empty completions (will be overwritten by localStorage if exists)
  const [habits, setHabits] = useState<any[]>([
    {
      id: '1',
      name: 'Drink 2L Water',
      icon: '💧',
      category: 'Health',
      reminderTime: '8:00 AM',
      completions: {},
      createdAt: 1704067200000, // Fixed timestamp
    },
    {
      id: '2',
      name: 'Read 10 pages',
      icon: '📖',
      category: 'Learning',
      reminderTime: '7:00 AM',
      completions: {},
      createdAt: 1704067200000,
    },
    {
      id: '3',
      name: '30 min workout',
      icon: '💪',
      category: 'Fitness',
      reminderTime: '6:00 AM',
      completions: {},
      createdAt: 1704067200000,
    },
    {
      id: '4',
      name: 'Meditation',
      icon: '🧘',
      category: 'Wellness',
      reminderTime: '9:00 AM',
      completions: {},
      createdAt: 1704067200000,
    },
  ]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState<string | null>(null);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedProfile = localStorage.getItem('profile');
    const savedNotes = localStorage.getItem('notes');
    const savedJournals = localStorage.getItem('journals');
    const savedHabits = localStorage.getItem('habits');
    const savedCalendarEvents = localStorage.getItem('calendarEvents');
    const savedOwnedSkins = localStorage.getItem('ownedSkins');
    const savedActiveSkin = localStorage.getItem('activeSkin');

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      // Ensure minimum 1000 coins
      if (parsedProfile.coins < 1000) {
        parsedProfile.coins = 1000;
        localStorage.setItem('profile', JSON.stringify(parsedProfile));
      }
      setProfile(parsedProfile);
    }
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedJournals) setJournalEntries(JSON.parse(savedJournals));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedCalendarEvents) setCalendarEvents(JSON.parse(savedCalendarEvents));
    if (savedOwnedSkins) setOwnedSkins(JSON.parse(savedOwnedSkins));
    if (savedActiveSkin) setActiveSkin(JSON.parse(savedActiveSkin));

    // Load tasks and projects
    const savedTasks = localStorage.getItem('tasks');
    const savedProjects = localStorage.getItem('projects');
    const savedClaimedRewards = localStorage.getItem('claimedRewards');
    if (savedTasks) setTasksState(JSON.parse(savedTasks));
    if (savedProjects) setProjectsState(JSON.parse(savedProjects));
    if (savedClaimedRewards) setClaimedRewards(JSON.parse(savedClaimedRewards));
    if (savedClaimedRewards) setClaimedRewards(JSON.parse(savedClaimedRewards));

    // Check Streak Logic
    checkStreak();
  }, []); // Remove profile dependency to avoid infinite loop if checkStreak updates profile

  const checkStreak = () => {
    // We need to access the LATEST profile from localStorage because state might be stale on mount
    const saved = localStorage.getItem('profile');
    if (!saved) return;

    const currentProfile: UserProfile = JSON.parse(saved);
    if (!currentProfile.lastActiveDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = new Date(currentProfile.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return; // Active today (0) or yesterday (1) -> Safe

    // Missed days exist
    const missedDays = diffDays - 1;
    const freezesOwned = currentProfile.inventory?.['streak-freeze'] || 0;

    if (freezesOwned >= missedDays) {
      // Protected by freeze
      const newInventory = { ...currentProfile.inventory };
      newInventory['streak-freeze'] -= missedDays;

      // We set lastActiveDate to "yesterday" to bridge the gap so they can continue streak today
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      updateProfile({
        inventory: newInventory,
        lastActiveDate: yesterday.toISOString().split('T')[0]
      });
      // Ideally notify user here
      console.log(`Streak protected! Used ${missedDays} freeze(s).`);
    } else {
      // Reset streak
      updateProfile({ currentStreak: 0 });
      console.log('Streak reset due to inactivity.');
    }
  };

  const recordActivity = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== todayStr) {
      // First activity of the day
      // Check if we are continuing a streak (lastActive was yesterday) or starting new (if reset happened)
      // Actually checkStreak() handles the reset logic on load.
      // So if we are here, and streak wasn't 0 (unless we just reset it), we increment?
      // Wait, if I missed a week, checkStreak reset it to 0. 
      // Then recordActivity sets it to 1. Correct.
      // If I was active yesterday, checkStreak did nothing. Streak is N.
      // recordActivity sets it to N+1. Correct.

      updateProfile({
        lastActiveDate: todayStr,
        currentStreak: (profile.currentStreak || 0) + 1
      });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('profile', JSON.stringify(updated));
      return updated;
    });
  };

  const addNote = (note: Note) => {
    setNotes((prev) => {
      const updated = [...prev, note];
      localStorage.setItem('notes', JSON.stringify(updated));
      return updated;
    });
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => {
      const updated = prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      );
      localStorage.setItem('notes', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((note) => note.id !== id);
      localStorage.setItem('notes', JSON.stringify(updated));
      return updated;
    });
  };

  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => {
      const updated = [...prev, entry];
      localStorage.setItem('journals', JSON.stringify(updated));
      return updated;
    });
  };

  const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries((prev) => {
      const updated = prev.map((entry) =>
        entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry
      );
      localStorage.setItem('journals', JSON.stringify(updated));
      return updated;
    });
  };

  const updateHabitCompletion = (habitId: string, date: Date, completed: boolean) => {
    setHabits((prev) => {
      const dateKey = date.toISOString().split('T')[0];
      const updated = prev.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            completions: {
              ...habit.completions,
              [dateKey]: completed,
            },
          };
        }
        return habit;
      });

      if (completed) {
        recordActivity();
      }

      localStorage.setItem('habits', JSON.stringify(updated));
      return updated;
    });
  };

  const addHabit = (habit: any) => {
    setHabits((prev) => {
      const updated = [...prev, habit];
      localStorage.setItem('habits', JSON.stringify(updated));
      return updated;
    });
  };

  const updateHabit = (id: string, updates: any) => {
    setHabits((prev) => {
      const updated = prev.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      );
      localStorage.setItem('habits', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => {
      const updated = prev.filter((habit) => habit.id !== id);
      localStorage.setItem('habits', JSON.stringify(updated));
      return updated;
    });
  };

  const addCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents((prev) => {
      const updated = [...prev, event];
      localStorage.setItem('calendarEvents', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) => {
      const updated = prev.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      );
      localStorage.setItem('calendarEvents', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => {
      const updated = prev.filter((event) => event.id !== id);
      localStorage.setItem('calendarEvents', JSON.stringify(updated));
      return updated;
    });
  };

  const purchaseSkin = (skinId: string, price: number) => {
    if (profile.coins >= price && !ownedSkins.includes(skinId)) {
      updateProfile({ coins: profile.coins - price });
      setOwnedSkins((prev) => {
        const updated = [...prev, skinId];
        localStorage.setItem('ownedSkins', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const purchaseItem = (itemId: string, price: number) => {
    if (profile.coins >= price) {
      updateProfile({
        coins: profile.coins - price,
        inventory: {
          ...(profile.inventory || {}),
          [itemId]: ((profile.inventory || {})[itemId] || 0) + 1,
        },
      });
    }
  };

  const activateSkin = (skinId: string) => {
    if (ownedSkins.includes(skinId)) {
      setActiveSkin(skinId);
      localStorage.setItem('activeSkin', JSON.stringify(skinId));
      updateProfile({ timerAnimation: skinId as any });
    }
  };

  const setTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const setProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    localStorage.setItem('projects', JSON.stringify(newProjects));
  };

  const earnCoins = (amount: number) => {
    updateProfile({ coins: profile.coins + amount });
  };

  const claimReward = (rewardId: string, amount: number): boolean => {
    if (claimedRewards.includes(rewardId)) {
      return false; // Already claimed
    }
    setClaimedRewards(prev => {
      const updated = [...prev, rewardId];
      localStorage.setItem('claimedRewards', JSON.stringify(updated));
      return updated;
    });
    earnCoins(amount);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        currentSession,
        setCurrentSession,
        notes,
        addNote,
        updateNote,
        deleteNote,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        updateHabitCompletion,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        ownedSkins,
        activeSkin,
        purchaseSkin,
        purchaseItem,
        activateSkin,
        tasks,
        projects,
        setTasks,
        setProjects,
        earnCoins,
        claimedRewards,
        claimReward,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

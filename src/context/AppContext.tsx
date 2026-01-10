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
    username: 'User',
    coins: 1000,
    totalXP: 2500,
    level: 12,
    theme: 'light',
    timerAnimation: 'coffee',
  });

  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<any[]>([
    {
      id: '1',
      name: 'Morning Exercise',
      icon: '🏃',
      completions: {},
      createdAt: Date.now(),
    },
    {
      id: '2',
      name: 'Read 30 minutes',
      icon: '📚',
      completions: {},
      createdAt: Date.now(),
    },
    {
      id: '3',
      name: 'Meditation',
      icon: '🧘',
      completions: {},
      createdAt: Date.now(),
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
  }, []);

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
        updateHabitCompletion,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        ownedSkins,
        activeSkin,
        purchaseSkin,
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

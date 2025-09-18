"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Task, TimetableEntry, Note } from '@/lib/types';
import { initialTasks, initialTimetable, initialNotes } from '@/lib/data';

interface AppContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  timetable: TimetableEntry[];
  setTimetable: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  return (
    <AppContext.Provider value={{ tasks, setTasks, timetable, setTimetable, notes, setNotes }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

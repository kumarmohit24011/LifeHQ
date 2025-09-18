"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ref, onValue, set, push, child, remove } from "firebase/database";
import { db } from '@/lib/firebase';
import type { Task, TimetableEntry, Note } from '@/lib/types';
import { initialTasks, initialTimetable, initialNotes } from '@/lib/data';

interface AppContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompleted: (taskId: string) => Promise<void>;
  timetable: TimetableEntry[];
  setTimetable: (timetable: TimetableEntry[]) => Promise<void>;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => Promise<void>;
  updateTimetableEntry: (entry: TimetableEntry) => Promise<void>;
  deleteTimetableEntry: (entryId: string) => Promise<void>;
  notes: Note[];
  setNotes: (notes: Note[]) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Function to seed initial data if the database is empty
const seedDatabase = () => {
  const tasksRef = ref(db, 'tasks');
  onValue(tasksRef, (snapshot) => {
    if (!snapshot.exists()) {
      const initialTasksWithIds = initialTasks.reduce((acc, task) => {
        acc[task.id] = { ...task, deadline: task.deadline.toISOString() };
        return acc;
      }, {} as any);
      set(ref(db, 'tasks'), initialTasksWithIds);
    }
  }, { onlyOnce: true });

  const timetableRef = ref(db, 'timetable');
  onValue(timetableRef, (snapshot) => {
    if (!snapshot.exists()) {
      const initialTimetableWithIds = initialTimetable.reduce((acc, entry) => {
        acc[entry.id] = entry;
        return acc;
      }, {} as any);
      set(ref(db, 'timetable'), initialTimetableWithIds);
    }
  }, { onlyOnce: true });
  
  const notesRef = ref(db, 'notes');
  onValue(notesRef, (snapshot) => {
    if (!snapshot.exists()) {
      const initialNotesWithIds = initialNotes.reduce((acc, note) => {
        acc[note.id] = { ...note, createdAt: note.createdAt.toISOString() };
        return acc;
      }, {} as any);
      set(ref(db, 'notes'), initialNotesWithIds);
    }
  }, { onlyOnce: true });
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [timetable, setTimetableState] = useState<TimetableEntry[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);

  useEffect(() => {
    seedDatabase();

    const tasksRef = ref(db, 'tasks');
    const unsubscribeTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTasks: Task[] = data ? Object.entries(data).map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        deadline: new Date(value.deadline),
      })) : [];
      setTasksState(loadedTasks);
    });

    const timetableRef = ref(db, 'timetable');
    const unsubscribeTimetable = onValue(timetableRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTimetable: TimetableEntry[] = data ? Object.entries(data).map(([key, value]) => ({
        ...(value as TimetableEntry),
        id: key,
      })) : [];
      setTimetableState(loadedTimetable);
    });

    const notesRef = ref(db, 'notes');
    const unsubscribeNotes = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedNotes: Note[] = data ? Object.entries(data).map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        createdAt: new Date(value.createdAt),
      })) : [];
      setNotesState(loadedNotes);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTimetable();
      unsubscribeNotes();
    };
  }, []);

  const setTasks = async (tasks: Task[]) => {
    const tasksWithIds = tasks.reduce((acc, task) => {
        acc[task.id] = { ...task, deadline: task.deadline.toISOString() };
        return acc;
      }, {} as any);
    await set(ref(db, 'tasks'), tasksWithIds);
  };
  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const newId = push(child(ref(db), 'tasks')).key;
    if (newId) {
        await set(ref(db, `tasks/${newId}`), { ...task, completed: false, deadline: task.deadline.toISOString() });
    }
  }
  const updateTask = async (task: Task) => {
    await set(ref(db, `tasks/${task.id}`), { ...task, deadline: task.deadline.toISOString() });
  }
  const deleteTask = async (taskId: string) => {
    await remove(ref(db, `tasks/${taskId}`));
  }
  const toggleTaskCompleted = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await set(ref(db, `tasks/${taskId}/completed`), !task.completed);
    }
  }

  const setTimetable = async (timetable: TimetableEntry[]) => {
     const timetableWithIds = timetable.reduce((acc, entry) => {
        acc[entry.id] = entry;
        return acc;
      }, {} as any);
    await set(ref(db, 'timetable'), timetableWithIds);
  };
  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
    const newId = push(child(ref(db), 'timetable')).key;
    if (newId) {
        await set(ref(db, `timetable/${newId}`), entry);
    }
  }
  const updateTimetableEntry = async (entry: TimetableEntry) => {
    await set(ref(db, `timetable/${entry.id}`), entry);
  }
  const deleteTimetableEntry = async (entryId: string) => {
    await remove(ref(db, `timetable/${entryId}`));
  }

  const setNotes = async (notes: Note[]) => {
     const notesWithIds = notes.reduce((acc, note) => {
        acc[note.id] = { ...note, createdAt: note.createdAt.toISOString() };
        return acc;
      }, {} as any);
    await set(ref(db, 'notes'), notesWithIds);
  };
   const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newId = push(child(ref(db), 'notes')).key;
    if (newId) {
        await set(ref(db, `notes/${newId}`), { ...note, createdAt: new Date().toISOString() });
    }
  }
  const updateNote = async (note: Note) => {
    await set(ref(db, `notes/${note.id}`), { ...note, createdAt: note.createdAt.toISOString() });
  }
  const deleteNote = async (noteId: string) => {
    await remove(ref(db, `notes/${noteId}`));
  }


  return (
    <AppContext.Provider value={{ 
        tasks, setTasks, addTask, updateTask, deleteTask, toggleTaskCompleted,
        timetable, setTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
        notes, setNotes, addNote, updateNote, deleteNote
    }}>
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

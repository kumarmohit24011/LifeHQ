"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ref, onValue, set, push, child, remove } from "firebase/database";
import { db } from '@/lib/firebase';
import type { Task, TimetableEntry, Note } from '@/lib/types';
import { useAuth } from './auth-context';

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

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [timetable, setTimetableState] = useState<TimetableEntry[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setTasksState([]);
      setTimetableState([]);
      setNotesState([]);
      return;
    };

    const tasksRef = ref(db, `users/${userId}/tasks`);
    const unsubscribeTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTasks: Task[] = data ? Object.entries(data).map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        deadline: new Date(value.deadline),
      })) : [];
      setTasksState(loadedTasks);
    });

    const timetableRef = ref(db, `users/${userId}/timetable`);
    const unsubscribeTimetable = onValue(timetableRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTimetable: TimetableEntry[] = data ? Object.entries(data).map(([key, value]) => ({
        ...(value as TimetableEntry),
        id: key,
      })) : [];
      setTimetableState(loadedTimetable);
    });

    const notesRef = ref(db, `users/${userId}/notes`);
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
  }, [userId]);

  const setTasks = async (tasks: Task[]) => {
    if (!userId) return;
    const tasksWithIds = tasks.reduce((acc, task) => {
        acc[task.id] = { ...task, deadline: task.deadline.toISOString() };
        return acc;
      }, {} as any);
    await set(ref(db, `users/${userId}/tasks`), tasksWithIds);
  };
  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    if (!userId) return;
    const newId = push(child(ref(db), `users/${userId}/tasks`)).key;
    if (newId) {
        await set(ref(db, `users/${userId}/tasks/${newId}`), { ...task, completed: false, deadline: task.deadline.toISOString() });
    }
  }
  const updateTask = async (task: Task) => {
    if (!userId) return;
    await set(ref(db, `users/${userId}/tasks/${task.id}`), { ...task, deadline: task.deadline.toISOString() });
  }
  const deleteTask = async (taskId: string) => {
    if (!userId) return;
    await remove(ref(db, `users/${userId}/tasks/${taskId}`));
  }
  const toggleTaskCompleted = async (taskId: string) => {
    if (!userId) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await set(ref(db, `users/${userId}/tasks/${taskId}/completed`), !task.completed);
    }
  }

  const setTimetable = async (timetable: TimetableEntry[]) => {
    if (!userId) return;
     const timetableWithIds = timetable.reduce((acc, entry) => {
        acc[entry.id] = entry;
        return acc;
      }, {} as any);
    await set(ref(db, `users/${userId}/timetable`), timetableWithIds);
  };
  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
    if (!userId) return;
    const newId = push(child(ref(db), `users/${userId}/timetable`)).key;
    if (newId) {
        await set(ref(db, `users/${userId}/timetable/${newId}`), entry);
    }
  }
  const updateTimetableEntry = async (entry: TimetableEntry) => {
    if (!userId) return;
    await set(ref(db, `users/${userId}/timetable/${entry.id}`), entry);
  }
  const deleteTimetableEntry = async (entryId: string) => {
    if (!userId) return;
    await remove(ref(db, `users/${userId}/timetable/${entryId}`));
  }

  const setNotes = async (notes: Note[]) => {
    if (!userId) return;
     const notesWithIds = notes.reduce((acc, note) => {
        acc[note.id] = { ...note, createdAt: note.createdAt.toISOString() };
        return acc;
      }, {} as any);
    await set(ref(db, `users/${userId}/notes`), notesWithIds);
  };
   const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const newId = push(child(ref(db), `users/${userId}/notes`)).key;
    if (newId) {
        await set(ref(db, `users/${userId}/notes/${newId}`), { ...note, createdAt: new Date().toISOString() });
    }
  }
  const updateNote = async (note: Note) => {
    if (!userId) return;
    await set(ref(db, `users/${userId}/notes/${note.id}`), { ...note, createdAt: note.createdAt.toISOString() });
  }
  const deleteNote = async (noteId: string) => {
    if (!userId) return;
    await remove(ref(db, `users/${userId}/notes/${noteId}`));
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

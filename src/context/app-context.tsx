"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ref, onValue, set, push, child, remove, get } from "firebase/database";
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
  isDirty: boolean;
  syncWithDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [timetable, setTimetableState] = useState<TimetableEntry[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setTasksState([]);
      setTimetableState([]);
      setNotesState([]);
      setIsDirty(false);
      return;
    }

    const loadLocalData = () => {
      try {
        const localTasks = localStorage.getItem(`tasks_${userId}`);
        const localTimetable = localStorage.getItem(`timetable_${userId}`);
        const localNotes = localStorage.getItem(`notes_${userId}`);
        const localIsDirty = localStorage.getItem(`isDirty_${userId}`) === 'true';

        if (localTasks && localTimetable && localNotes) {
          setTasksState(JSON.parse(localTasks, (key, value) => key === 'deadline' || key === 'createdAt' ? new Date(value) : value));
          setTimetableState(JSON.parse(localTimetable));
          setNotesState(JSON.parse(localNotes, (key, value) => key === 'createdAt' ? new Date(value) : value));
          setIsDirty(localIsDirty);
        } else {
          // If no local data, fetch from firebase
          syncWithDatabase(true);
        }
      } catch (error) {
        console.error("Failed to load local data", error);
        syncWithDatabase(true);
      }
    };
    
    loadLocalData();
    
    // We will now handle data fetching via the sync button, not on mount.
    // The onValue listeners are removed to prevent overwriting local state.

  }, [userId]);
  
  const setDirty = (dirty: boolean) => {
    setIsDirty(dirty);
    if (userId) {
      localStorage.setItem(`isDirty_${userId}`, String(dirty));
    }
  }

  const syncWithDatabase = async (initialLoad = false) => {
    if (!userId) return;

    const tasksRef = ref(db, `users/${userId}/tasks`);
    const timetableRef = ref(db, `users/${userId}/timetable`);
    const notesRef = ref(db, `users/${userId}/notes`);

    // If it's not the initial load, we push local changes to DB
    if (!initialLoad) {
      const tasksToUpload = tasks.reduce((acc, task) => {
        acc[task.id] = { ...task, deadline: task.deadline.toISOString() };
        return acc;
      }, {} as any);
      const timetableToUpload = timetable.reduce((acc, entry) => {
        acc[entry.id] = entry;
        return acc;
      }, {} as any);
       const notesToUpload = notes.reduce((acc, note) => {
        acc[note.id] = { ...note, createdAt: note.createdAt.toISOString() };
        return acc;
      }, {} as any);

      await set(tasksRef, tasksToUpload);
      await set(timetableRef, timetableToUpload);
      await set(notesRef, notesToUpload);

    } else { // On initial load, we fetch from DB and overwrite local
      const [tasksSnapshot, timetableSnapshot, notesSnapshot] = await Promise.all([
        get(tasksRef),
        get(timetableRef),
        get(notesRef),
      ]);

      const tasksData = tasksSnapshot.val();
      const loadedTasks: Task[] = tasksData ? Object.entries(tasksData).map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        deadline: new Date(value.deadline),
      })) : [];
      setTasksState(loadedTasks);
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(loadedTasks));
      
      const timetableData = timetableSnapshot.val();
      const loadedTimetable: TimetableEntry[] = timetableData ? Object.entries(timetableData).map(([key, value]) => ({
        ...(value as TimetableEntry),
        id: key,
      })) : [];
      setTimetableState(loadedTimetable);
      localStorage.setItem(`timetable_${userId}`, JSON.stringify(loadedTimetable));
      
      const notesData = notesSnapshot.val();
      const loadedNotes: Note[] = notesData ? Object.entries(notesData).map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        createdAt: new Date(value.createdAt),
      })) : [];
      setNotesState(loadedNotes);
      localStorage.setItem(`notes_${userId}`, JSON.stringify(loadedNotes));
    }
    
    setDirty(false);
  };
  
  const updateLocalAndSetDirty = <T>(key: 'tasks' | 'timetable' | 'notes', data: T[]) => {
    if (!userId) return;
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(data));
    setDirty(true);
  }

  const setTasks = async (tasks: Task[]) => {
    setTasksState(tasks);
    updateLocalAndSetDirty('tasks', tasks);
  };
  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const newId = push(child(ref(db), 'temp')).key || Date.now().toString();
    const newTask = { ...task, id: newId, completed: false };
    const newTasks = [...tasks, newTask];
    setTasksState(newTasks);
    updateLocalAndSetDirty('tasks', newTasks);
  }
  const updateTask = async (task: Task) => {
    const newTasks = tasks.map(t => t.id === task.id ? task : t);
    setTasksState(newTasks);
    updateLocalAndSetDirty('tasks', newTasks);
  }
  const deleteTask = async (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasksState(newTasks);
    updateLocalAndSetDirty('tasks', newTasks);
  }
  const toggleTaskCompleted = async (taskId: string) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasksState(newTasks);
    updateLocalAndSetDirty('tasks', newTasks);
  }

  const setTimetable = async (timetable: TimetableEntry[]) => {
    setTimetableState(timetable);
    updateLocalAndSetDirty('timetable', timetable);
  };
  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
    const newId = push(child(ref(db), 'temp')).key || Date.now().toString();
    const newEntry = { ...entry, id: newId };
    const newTimetable = [...timetable, newEntry];
    setTimetableState(newTimetable);
    updateLocalAndSetDirty('timetable', newTimetable);
  }
  const updateTimetableEntry = async (entry: TimetableEntry) => {
    const newTimetable = timetable.map(e => e.id === entry.id ? entry : e);
    setTimetableState(newTimetable);
    updateLocalAndSetDirty('timetable', newTimetable);
  }
  const deleteTimetableEntry = async (entryId: string) => {
    const newTimetable = timetable.filter(e => e.id !== entryId);
    setTimetableState(newTimetable);
    updateLocalAndSetDirty('timetable', newTimetable);
  }

  const setNotes = async (notes: Note[]) => {
    setNotesState(notes);
    updateLocalAndSetDirty('notes', notes);
  };
   const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newId = push(child(ref(db), 'temp')).key || Date.now().toString();
    const newNote = { ...note, id: newId, createdAt: new Date() };
    const newNotes = [...notes, newNote];
    setNotesState(newNotes);
    updateLocalAndSetDirty('notes', newNotes);
  }
  const updateNote = async (note: Note) => {
    const newNotes = notes.map(n => n.id === note.id ? note : n);
    setNotesState(newNotes);
    updateLocalAndSetDirty('notes', newNotes);
  }
  const deleteNote = async (noteId: string) => {
    const newNotes = notes.filter(n => n.id !== noteId);
    setNotesState(newNotes);
    updateLocalAndSetDirty('notes', newNotes);
  }


  return (
    <AppContext.Provider value={{ 
        tasks, setTasks, addTask, updateTask, deleteTask, toggleTaskCompleted,
        timetable, setTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
        notes, setNotes, addNote, updateNote, deleteNote,
        isDirty, syncWithDatabase
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

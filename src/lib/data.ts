import type { Task, TimetableEntry, Note } from './types';

export const initialTasks: Task[] = [];

export const initialTimetable: TimetableEntry[] = [
  {
    id: 'tt-1',
    subject: 'Daily Standup',
    startTime: '09:00',
    endTime: '09:15',
  },
  {
    id: 'tt-2',
    subject: 'Focus Work: Reporting',
    startTime: '09:30',
    endTime: '12:00',
  },
  {
    id: 'tt-3',
    subject: 'Lunch Break',
    startTime: '12:00',
    endTime: '13:00',
  },
  {
    id: 'tt-4',
    subject: 'Client Call: Project Alpha',
    startTime: '14:00',
    endTime: '15:00',
  },
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Meeting Notes: Project Alpha',
    content: '- Client is happy with the progress.\n- Need to finalize the new feature list by EOD Friday.\n- John to send over the updated mockups.',
    createdAt: new Date(),
  },
  {
    id: 'note-2',
    title: 'Brainstorming: Q4 Goals',
    content: '1. Increase user engagement by 15%.\n2. Launch the new mobile app.\n3. Reduce server costs by 10% through optimization.',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
];

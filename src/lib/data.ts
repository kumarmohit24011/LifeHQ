import type { Task, TimetableEntry, Note } from './types';

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finish Q3 Report',
    description: 'Compile all data and write the final report for the third quarter.',
    priority: 'High',
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Plan Team Offsite',
    description: 'Finalize venue, activities, and budget for the upcoming team offsite.',
    priority: 'Medium',
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Update Design System',
    description: 'Incorporate new components into the main design system library.',
    priority: 'Medium',
    deadline: new Date(new Date().setDate(new Date().getDate() + 10)),
    completed: true,
  },
  {
    id: 'task-4',
    title: 'Book Dentist Appointment',
    description: 'Schedule a routine check-up.',
    priority: 'Low',
    deadline: new Date(new Date().setDate(new Date().getDate() + 14)),
    completed: false,
  },
];

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

export type Priority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  deadline: Date;
  completed: boolean;
};

export type TimetableEntry = {
  id:string;
  subject: string;
  startTime: string; 
  endTime: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

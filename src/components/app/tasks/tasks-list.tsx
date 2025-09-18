"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { TaskCard } from "./task-card";
import { AddEditTaskDialog } from "./add-edit-task-dialog";
import { useAppContext } from "@/context/app-context";
import type { Task } from '@/lib/types';

export function TasksList() {
  const { tasks } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddNew = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [tasks, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your daily tasks and stay organized.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={handleEdit} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No tasks found.</p>
          <p>Add a new task to get started!</p>
        </div>
      )}

      <Button 
        onClick={handleAddNew}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add new task</span>
      </Button>

      <AddEditTaskDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        task={editingTask}
      />
    </div>
  );
}

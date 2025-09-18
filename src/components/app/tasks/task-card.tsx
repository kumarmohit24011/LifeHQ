"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-context";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
  High: "bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400",
  Medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
  Low: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400",
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { setTasks } = useAppContext();

  const handleToggleComplete = () => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = () => {
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <Card className={cn("transition-all", task.completed && "bg-muted/50")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
             <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="h-5 w-5"
            />
            <div className="grid gap-1">
              <CardTitle className={cn("text-lg", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </CardTitle>
              <CardDescription className={cn(task.completed && "line-through text-muted-foreground")}>
                Due by {format(task.deadline, "PPP")}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <p className={cn("text-sm text-muted-foreground", task.completed && "line-through")}>
            {task.description}
          </p>
          <Badge variant="outline" className={cn(priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

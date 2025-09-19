"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import type { Task, Priority } from "@/lib/types";
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import { suggestTaskDetails } from "@/ai/flows/ai-suggest-task-details";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  priority: z.enum(["Low", "Medium", "High"]),
  deadline: z.date({ required_error: "A deadline is required." }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddEditTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  task: Task | null;
}

export function AddEditTaskDialog({ isOpen, setIsOpen, task }: AddEditTaskDialogProps) {
  const { tasks, timetable, addTask, updateTask } = useAppContext();
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      deadline: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'Medium',
        deadline: task?.deadline || new Date(),
      });
    }
  }, [isOpen, task, form]);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      if (task) {
        await updateTask({ ...task, ...data });
        toast({ title: "Task updated!" });
      } else {
        await addTask(data);
        toast({ title: "Task created!" });
      }
      setIsOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save task."});
    }
  };

  const handleSuggestDetails = async () => {
    const taskDescription = form.getValues("description");
    if (!taskDescription) {
      form.setError("description", { message: "Please enter a description first." });
      return;
    }
    
    setIsAiLoading(true);
    try {
      const scheduleText = `Current Tasks:\n${tasks.map(t => `- ${t.title} (Due: ${format(t.deadline, "yyyy-MM-dd")})`).join('\n')}\n\nCurrent Timetable:\n${timetable.map(e => `- ${e.subject} (${e.startTime}-${e.endTime})`).join('\n')}`;

      const result = await suggestTaskDetails({
        taskDescription,
        currentSchedule: scheduleText,
      });

      if (result.suggestedPriority && result.suggestedDeadline) {
        form.setValue("priority", result.suggestedPriority as Priority);
        form.setValue("deadline", new Date(result.suggestedDeadline));
        toast({ title: "AI Suggestion Applied!", description: "Priority and deadline have been updated." });
      } else {
        throw new Error("Invalid response from AI.");
      }
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({ variant: "destructive", title: "AI Suggestion Failed", description: "Could not get suggestions. Please try again." });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task ? "Edit Task" : "Add a New Task"}</DialogTitle>
          <DialogDescription>
            Fill in the details below. You can also use AI to suggest a priority and deadline.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about your task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4 gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={handleSuggestDetails} disabled={isAiLoading}>
                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest Details
              </Button>
              <Button type="submit" size="lg">
                {task ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

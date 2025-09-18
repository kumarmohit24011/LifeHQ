"use client";

import { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import type { TimetableEntry } from '@/lib/types';
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";

const entrySchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

type EntryFormValues = z.infer<typeof entrySchema>;

interface AddEditTimetableEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  entry: TimetableEntry | null;
}

export function AddEditTimetableEntryDialog({ isOpen, setIsOpen, entry }: AddEditTimetableEntryDialogProps) {
  const { addTimetableEntry, updateTimetableEntry } = useAppContext();
  const { toast } = useToast();

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      subject: '',
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        subject: entry?.subject || '',
        startTime: entry?.startTime || '09:00',
        endTime: entry?.endTime || '10:00',
      });
    }
  }, [isOpen, entry, form]);

  const onSubmit = async (data: EntryFormValues) => {
    try {
      if (entry) {
        await updateTimetableEntry({ ...entry, ...data });
        toast({ title: "Timetable entry updated!" });
      } else {
        await addTimetableEntry(data);
        toast({ title: "Timetable entry created!" });
      }
      setIsOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save timetable entry."});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Entry" : "Add Timetable Entry"}</DialogTitle>
          <DialogDescription>
            Add a new subject or event to your daily schedule.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject / Event</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Focus Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {entry ? "Save Changes" : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import type { Note } from '@/lib/types';
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface AddEditNoteDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  note: Note | null;
}

export function AddEditNoteDialog({ isOpen, setIsOpen, note }: AddEditNoteDialogProps) {
  const { setNotes } = useAppContext();
  const { toast } = useToast();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: note?.title || '',
        content: note?.content || '',
      });
    }
  }, [isOpen, note, form]);

  const onSubmit = (data: NoteFormValues) => {
    if (note) {
      setNotes(prev => prev.map(n => n.id === note.id ? { ...note, ...data } : n));
      toast({ title: "Note updated!" });
    } else {
      const newNote: Note = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      setNotes(prev => [newNote, ...prev]);
      toast({ title: "Note created!" });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create a New Note"}</DialogTitle>
          <DialogDescription>
            Write down your thoughts and save them for later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your notes here..." className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {note ? "Save Changes" : "Create Note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

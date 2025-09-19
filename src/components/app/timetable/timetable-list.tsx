"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddEditTimetableEntryDialog } from "./add-edit-timetable-entry-dialog";
import type { TimetableEntry } from '@/lib/types';
import { useAppContext } from '@/context/app-context';
import { useToast } from "@/hooks/use-toast";

export function TimetableList() {
  const { timetable, deleteTimetableEntry } = useAppContext();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const handleAddNew = () => {
    setEditingEntry(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTimetableEntry(id);
      toast({ title: "Timetable entry deleted!" });
    } catch(error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete timetable entry."});
    }
  };

  const sortedTimetable = [...timetable].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">Your daily schedule at a glance.</p>
        </div>
      </header>

      <div className="grid gap-4">
        {sortedTimetable.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm bg-muted text-muted-foreground rounded-md px-2 py-1">
                  {entry.startTime} - {entry.endTime}
                </div>
                <p className="font-medium">{entry.subject}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(entry)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(entry.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
        {sortedTimetable.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Your timetable is empty.</p>
            <p>Add an event to get started!</p>
          </div>
        )}
      </div>

      <Button 
        onClick={handleAddNew}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add new timetable entry</span>
      </Button>

      <AddEditTimetableEntryDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        entry={editingEntry}
      />
    </div>
  );
}

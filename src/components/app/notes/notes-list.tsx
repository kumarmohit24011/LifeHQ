"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { NoteCard } from "./note-card";
import { AddEditNoteDialog } from "./add-edit-note-dialog";
import { useAppContext } from "@/context/app-context";
import type { Note } from '@/lib/types';

export function NotesList() {
  const { notes } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleAddNew = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notes, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Jot down your thoughts and ideas.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredNotes.map(note => (
          <NoteCard key={note.id} note={note} onEdit={handleEdit} />
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No notes found.</p>
          <p>Create a new note to get started!</p>
        </div>
      )}

      <Button 
        onClick={handleAddNew}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add new note</span>
      </Button>

      <AddEditNoteDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        note={editingNote}
      />
    </div>
  );
}

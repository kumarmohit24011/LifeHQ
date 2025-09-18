"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OptimizeResultDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    optimizedSchedule: string;
}

export function OptimizeResultDialog({ isOpen, setIsOpen, optimizedSchedule }: OptimizeResultDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>AI Optimized Schedule</AlertDialogTitle>
          <AlertDialogDescription>
            Based on your tasks and current schedule, here is a more efficient arrangement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="max-h-60 w-full rounded-md border p-4">
            <pre className="text-sm whitespace-pre-wrap font-sans">{optimizedSchedule}</pre>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogAction>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

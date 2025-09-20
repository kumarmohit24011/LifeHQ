"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Cloud, CloudCog } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";

export function SyncButton() {
  const { isDirty, syncWithDatabase } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithDatabase();
      toast({ title: "Sync Successful!", description: "Your data is saved to the cloud." });
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not sync with the database. Please try again." });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      variant={isDirty ? "default" : "outline"} 
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <CloudCog className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Cloud className="mr-2 h-4 w-4" />
      )}
      {isSyncing ? "Syncing..." : isDirty ? "Sync Now" : "Synced"}
    </Button>
  );
}

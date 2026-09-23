"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { archiveMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui";

export function ArchiveToggle({ meetingId, status }: { meetingId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={status === "ARCHIVED" ? ArchiveRestore : Archive}
      disabled={pending}
      onClick={() => startTransition(() => archiveMeeting(meetingId))}
    >
      {status === "ARCHIVED" ? "Unarchive" : "Archive"}
    </Button>
  );
}

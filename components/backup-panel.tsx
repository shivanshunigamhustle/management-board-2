"use client";

import { useState, useTransition } from "react";
import { DatabaseBackup, CheckCircle2, AlertTriangle } from "lucide-react";
import { runBackupNow } from "@/lib/actions/backup";
import { Button } from "@/components/ui";

export function BackupPanel() {
  const [pending, startTransition] = useTransition();
  const [last, setLast] = useState<{ fileName: string; at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {last ? (
          <p className="flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Downloaded {last.fileName} · {new Date(last.at).toLocaleTimeString()}
          </p>
        ) : (
          <p className="text-sm text-slate-600">No backup taken this session.</p>
        )}
        <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
          Downloads a full JSON snapshot of every record straight to your device — no server-side file storage
          involved, so it works the same locally or in production. Your hosted database provider (e.g. Neon,
          Vercel Postgres) also runs its own automated backups independently of this button.
        </p>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
      </div>
      <Button
        variant="secondary"
        size="sm"
        icon={DatabaseBackup}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              const result = await runBackupNow();
              const blob = new Blob([result.dataJson], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = result.fileName;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              setLast({ fileName: result.fileName, at: result.at });
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Backup failed.");
            }
          })
        }
      >
        {pending ? "Preparing…" : "Back up now"}
      </Button>
    </div>
  );
}

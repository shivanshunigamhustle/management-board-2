"use client";

import { useState, useTransition } from "react";
import { PenLine, KeyRound, AlertTriangle } from "lucide-react";
import { approveDocument } from "@/lib/actions/meetings";
import { Button } from "@/components/ui";

export function ESignModal({
  documentId,
  meetingId,
  fileName,
  onSigned,
}: {
  documentId: string;
  meetingId: string;
  fileName: string;
  onSigned: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="secondary" size="sm" icon={PenLine} onClick={() => setOpen(true)}>
        Approve / E-Sign
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-fade">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 mb-4">
              <KeyRound className="h-5 w-5 text-indigo-600" strokeWidth={2} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Confirm your identity to sign</h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Re-enter your password to electronically sign <span className="font-medium text-slate-700">{fileName}</span>.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mb-2"
            />
            {error && (
              <p className="flex items-start gap-1.5 text-xs text-red-600 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setPassword("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={pending || !password}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await approveDocument(documentId, meetingId, password);
                      setOpen(false);
                      setPassword("");
                      setError(null);
                      onSigned();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not sign.");
                    }
                  })
                }
              >
                {pending ? "Signing…" : "Sign document"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

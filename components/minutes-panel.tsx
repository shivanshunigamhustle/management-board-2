"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Sparkles, Save, CheckCircle2, ScrollText } from "lucide-react";
import { finalizeMinutes, saveDraftMinutes } from "@/lib/actions/meetings";
import { EmptyState, Button } from "@/components/ui";

const MINUTES_TEMPLATE = (title: string) => `Meeting: ${title}
Date: ${format(new Date(), "MMMM d, yyyy")}

1. Call to order & quorum confirmed
2. Approval of previous minutes
3. Matters discussed:
   -
4. Resolutions passed:
   -
5. Action items assigned:
   -
6. Meeting adjourned at:
`;

export function MinutesPanel({
  meetingId,
  meetingTitle,
  initialContent,
  finalizedAt,
  isAdmin,
}: {
  meetingId: string;
  meetingTitle: string;
  initialContent: string;
  finalizedAt: Date | null;
  isAdmin: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  if (!isAdmin) {
    if (!finalizedAt) return <EmptyState icon={ScrollText}>Minutes have not been finalized yet.</EmptyState>;
    return (
      <div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Finalized {format(finalizedAt, "MMM d, yyyy · h:mm a")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!content.trim() && (
        <button
          type="button"
          onClick={() => setContent(MINUTES_TEMPLATE(meetingTitle))}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" /> Insert standard minutes template
        </button>
      )}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaved(false);
        }}
        rows={6}
        placeholder="Take live minutes and notes here…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={Save}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveDraftMinutes(meetingId, content);
              setSaved(true);
            })
          }
        >
          {saved ? "Saved" : "Save draft"}
        </Button>
        <Button
          size="sm"
          icon={CheckCircle2}
          disabled={pending || !content.trim()}
          onClick={() => startTransition(() => finalizeMinutes(meetingId, content))}
        >
          Finalize &amp; distribute minutes
        </Button>
        {finalizedAt && (
          <span className="text-xs text-slate-400">Finalized {format(finalizedAt, "MMM d, h:mm a")}</span>
        )}
      </div>
    </div>
  );
}

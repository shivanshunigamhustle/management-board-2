"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { castVote } from "@/lib/actions/meetings";

const CHOICES = [
  { value: "FOR" as const, label: "For", icon: ThumbsUp, activeClass: "bg-emerald-600 hover:bg-emerald-700", barClass: "bg-emerald-500" },
  { value: "AGAINST" as const, label: "Against", icon: ThumbsDown, activeClass: "bg-red-600 hover:bg-red-700", barClass: "bg-red-500" },
  { value: "ABSTAIN" as const, label: "Abstain", icon: MinusCircle, activeClass: "bg-slate-500 hover:bg-slate-600", barClass: "bg-slate-400" },
];

export function VotePanel({
  resolutionId,
  meetingId,
  text,
  tally,
  myChoice,
}: {
  resolutionId: string;
  meetingId: string;
  text: string;
  tally: { FOR: number; AGAINST: number; ABSTAIN: number };
  myChoice?: "FOR" | "AGAINST" | "ABSTAIN";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const total = tally.FOR + tally.AGAINST + tally.ABSTAIN;

  function vote(choice: "FOR" | "AGAINST" | "ABSTAIN") {
    startTransition(async () => {
      try {
        await castVote(resolutionId, meetingId, choice);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not cast vote.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <p className="text-sm font-medium text-slate-900 mb-3">{text}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {CHOICES.map((c) => {
          const Icon = c.icon;
          const active = myChoice === c.value;
          return (
            <button
              key={c.value}
              onClick={() => vote(c.value)}
              disabled={pending}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all disabled:opacity-50 ${c.activeClass} ${
                active ? "ring-2 ring-offset-2 ring-slate-900" : ""
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-1.5">
        {CHOICES.map((c) => {
          const count = tally[c.value];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={c.value} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-slate-500">{c.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${c.barClass}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-right text-slate-500 tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
      {myChoice && (
        <p className="flex items-center gap-1 text-xs text-emerald-700 mt-2.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> You voted: {myChoice}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-2.5">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

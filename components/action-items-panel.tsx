"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { toggleActionItem } from "@/lib/actions/meetings";
import { Badge, EmptyState } from "@/components/ui";

export function ActionItemsPanel({
  meetingId,
  items,
  currentUserId,
}: {
  meetingId: string;
  items: {
    id: string;
    description: string;
    status: string;
    dueDate: Date | null;
    assignedTo: { id: string; name: string };
  }[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();

  if (items.length === 0) return <EmptyState icon={ListChecks}>No action items for this meeting.</EmptyState>;

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const canToggle = item.assignedTo.id === currentUserId;
        const done = item.status === "DONE";
        return (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                disabled={!canToggle || pending}
                onClick={() => startTransition(() => toggleActionItem(item.id, meetingId))}
                className="shrink-0 disabled:cursor-not-allowed"
                title={canToggle ? "Toggle status" : "Only the assignee can update this"}
                aria-label={
                  canToggle
                    ? `Mark "${item.description}" as ${done ? "open" : "done"}`
                    : `Only ${item.assignedTo.name} can update this action item`
                }
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                ) : (
                  <Circle className={`h-5 w-5 ${canToggle ? "text-slate-300 hover:text-slate-400" : "text-slate-200"} transition-colors`} strokeWidth={2} />
                )}
              </button>
              <div className="min-w-0">
                <p className={`text-sm ${done ? "text-slate-400 line-through" : "text-slate-900"}`}>
                  {item.description}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.assignedTo.name}
                  {item.dueDate ? ` · due ${format(item.dueDate, "MMM d")}` : ""}
                </p>
              </div>
            </div>
            <Badge status={item.status}>{item.status}</Badge>
          </li>
        );
      })}
    </ul>
  );
}

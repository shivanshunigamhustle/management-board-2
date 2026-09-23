"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Video, ScrollText, AlertTriangle, Send } from "lucide-react";
import { createMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export function NewMeetingForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [type, setType] = useState<"MEETING" | "CIRCULAR">("MEETING");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const data = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const id = await createMeeting({
              title: String(data.get("title")),
              type,
              scheduledAt: String(data.get("scheduledAt")),
              categoryId: String(data.get("categoryId") || ""),
              description: String(data.get("description") || ""),
              joinLink: String(data.get("joinLink") || ""),
              scheduledArchiveAt: String(data.get("scheduledArchiveAt") || "") || undefined,
            });
            router.push(`/admin/meetings/${id}/agenda`);
          } catch {
            setError("Could not create meeting. Please check the fields and try again.");
          }
        });
      }}
      className="space-y-5 max-w-xl"
    >
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {(
          [
            { value: "MEETING" as const, label: "Meeting", icon: Video },
            { value: "CIRCULAR" as const, label: "Circular", icon: ScrollText },
          ]
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              type === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div>
        <label className={labelClass}>{type === "MEETING" ? "Meeting title" : "Circular subject"}</label>
        <input name="title" required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{type === "MEETING" ? "Date & time" : "Target date"}</label>
          <input name="scheduledAt" type="datetime-local" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category / subcategory</label>
          <select name="categoryId" className={inputClass}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === "MEETING" && (
        <div>
          <label className={labelClass}>Join link</label>
          <input name="joinLink" placeholder="https://meet.example.com/…" className={inputClass} />
        </div>
      )}

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Scheduled archival &amp; disposal date (optional)</label>
        <input name="scheduledArchiveAt" type="date" className={inputClass} />
        <p className="text-[11px] text-slate-400 mt-1.5">
          The meeting and its pack will be automatically archived on this date.
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <Button type="submit" icon={Send} disabled={pending}>
        {pending ? "Creating…" : `Create ${type === "MEETING" ? "meeting" : "circular"} & invite all members`}
      </Button>
    </form>
  );
}

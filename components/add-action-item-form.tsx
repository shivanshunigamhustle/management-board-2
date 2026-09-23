"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addActionItem } from "@/lib/actions/meetings";

export function AddActionItemForm({
  meetingId,
  users,
}: {
  meetingId: string;
  users: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <Plus className="h-3.5 w-3.5" /> Assign action item
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        startTransition(async () => {
          await addActionItem(
            meetingId,
            String(data.get("assignedToId")),
            String(data.get("description")),
            String(data.get("dueDate") || "") || undefined
          );
          form.reset();
          setOpen(false);
        });
      }}
      className="flex flex-wrap items-center gap-1.5 animate-fade"
    >
      <select name="assignedToId" required className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none">
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <input
        name="description"
        required
        placeholder="Description"
        className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs w-36 focus:border-indigo-400 focus:outline-none"
      />
      <input name="dueDate" type="date" className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
        Cancel
      </button>
    </form>
  );
}

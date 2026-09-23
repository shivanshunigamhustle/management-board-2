"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { addDocumentComment } from "@/lib/actions/documents";

export function DocumentComments({
  documentId,
  meetingId,
  comments,
}: {
  documentId: string;
  meetingId?: string;
  comments: { id: string; content: string; createdAt: Date; user: { name: string } }[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
      >
        <MessageCircle className="h-3 w-3" />
        {comments.length} annotation{comments.length === 1 ? "" : "s"}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-xl bg-slate-50 p-2.5 animate-fade">
          {comments.length === 0 && <p className="text-[11px] text-slate-400">No annotations yet.</p>}
          {comments.map((c) => (
            <div key={c.id} className="text-xs">
              <span className="font-medium text-slate-800">{c.user.name}</span>{" "}
              <span className="text-slate-400 text-[10px]">{format(c.createdAt, "MMM d, h:mm a")}</span>
              <p className="text-slate-600">{c.content}</p>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              startTransition(async () => {
                await addDocumentComment(documentId, text.trim(), meetingId);
                setText("");
              });
            }}
            className="flex gap-1.5 pt-1"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add an annotation…"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
            <button
              type="submit"
              disabled={pending}
              aria-label="Add annotation"
              className="flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

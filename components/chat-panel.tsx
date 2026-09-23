"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Send, MessageSquare } from "lucide-react";
import { sendChatMessage } from "@/lib/actions/meetings";
import { EmptyState } from "@/components/ui";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ChatPanel({
  meetingId,
  messages,
}: {
  meetingId: string;
  messages: { id: string; content: string; createdAt: Date; user: { name: string } }[];
}) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="max-h-72 overflow-y-auto space-y-3 rounded-xl bg-slate-50 p-3 scrollbar-thin">
        {messages.length === 0 ? (
          <EmptyState icon={MessageSquare}>No messages yet — say hello.</EmptyState>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-slate-500 shadow-sm">
                {initials(m.user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs">
                  <span className="font-medium text-slate-800">{m.user.name}</span>{" "}
                  <span className="text-slate-400 text-[10px]">{format(m.createdAt, "h:mm a")}</span>
                </p>
                <p className="text-sm text-slate-700 leading-snug">{m.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          startTransition(async () => {
            await sendChatMessage(meetingId, text.trim());
            setText("");
          });
        }}
        className="flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message the meeting…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Send message"
          className="flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

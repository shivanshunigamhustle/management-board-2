"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, Paperclip, Upload, Send, CheckCircle2, ListOrdered } from "lucide-react";
import { addAgendaItem, removeAgendaItem, moveAgendaItem, publishAgenda } from "@/lib/actions/meetings";
import { uploadDocument } from "@/lib/actions/documents";
import { EmptyState, Button } from "@/components/ui";

type AgendaItem = { id: string; order: number; title: string; document: { fileName: string } | null };
type Document = { id: string; fileName: string };

const AGENDA_TEMPLATES = [
  "Approval of previous minutes",
  "Chair's report",
  "Financial / CFO update",
  "Risk & compliance update",
  "Any other business",
];

export function AgendaBuilder({
  meetingId,
  items,
  documents,
}: {
  meetingId: string;
  items: AgendaItem[];
  documents: Document[];
}) {
  const [pending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState("");
  const [published, setPublished] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        {items.length === 0 ? (
          <EmptyState icon={ListOrdered}>No agenda items yet — add the first one below.</EmptyState>
        ) : (
          <ol className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-500 shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 truncate">{item.title}</p>
                    {item.document && (
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Paperclip className="h-3 w-3" /> {item.document.fileName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    disabled={pending || idx === 0}
                    onClick={() => startTransition(() => moveAgendaItem(meetingId, item.id, "up"))}
                    aria-label={`Move "${item.title}" up`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={pending || idx === items.length - 1}
                    onClick={() => startTransition(() => moveAgendaItem(meetingId, item.id, "down"))}
                    aria-label={`Move "${item.title}" down`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => startTransition(() => removeAgendaItem(item.id, meetingId))}
                    aria-label={`Remove "${item.title}" from agenda`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;
          startTransition(async () => {
            await addAgendaItem(meetingId, newTitle.trim());
            setNewTitle("");
          });
        }}
        className="flex gap-2"
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add agenda item…"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
        <Button icon={Plus} disabled={pending} type="submit">
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[11px] text-slate-400 mr-1 self-center">Templates:</span>
        {AGENDA_TEMPLATES.map((t) => (
          <button
            key={t}
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => addAgendaItem(meetingId, t))}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 disabled:opacity-50 transition-colors"
          >
            + {t}
          </button>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
          <Upload className="h-4 w-4 text-slate-400" /> Attach or update a document
        </h3>
        <form
          action={(formData) =>
            startTransition(async () => {
              await uploadDocument(formData);
            })
          }
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="meetingId" value={meetingId} />
          <input
            type="file"
            name="file"
            required
            className="text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700"
          />
          <Button variant="secondary" size="sm" type="submit" disabled={pending}>
            Upload / update pack
          </Button>
        </form>
        {documents.length > 0 && (
          <ul className="mt-3 space-y-1">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                <Paperclip className="h-3 w-3" /> {d.fileName}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 pt-5">
        <Button
          icon={published ? CheckCircle2 : Send}
          disabled={pending || items.length === 0}
          onClick={() =>
            startTransition(async () => {
              await publishAgenda(meetingId);
              setPublished(true);
            })
          }
        >
          {published ? "Published" : "Publish & circulate to members"}
        </Button>
      </div>
    </div>
  );
}

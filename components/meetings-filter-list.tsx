"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Video, ScrollText, ChevronRight, CalendarClock, Archive } from "lucide-react";
import { Card, Badge, EmptyState } from "@/components/ui";
import type { getMeetingsList } from "@/lib/data";

type Meeting = Awaited<ReturnType<typeof getMeetingsList>>[number];
type Category = { id: string; name: string; parentId: string | null };

export function MeetingsFilterList({
  meetings,
  categories,
  basePath,
}: {
  meetings: Meeting[];
  categories: Category[];
  basePath: string;
}) {
  const [categoryId, setCategoryId] = useState("ALL");
  const [type, setType] = useState<"ALL" | "MEETING" | "CIRCULAR">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meetings.filter((m) => {
      if (categoryId !== "ALL" && m.categoryId !== categoryId) return false;
      if (type !== "ALL" && m.type !== type) return false;
      if (q && !m.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [meetings, categoryId, type, query]);

  const now = new Date();
  const upcoming = filtered.filter((m) => m.scheduledAt >= now && m.status !== "ARCHIVED");
  const past = filtered.filter((m) => m.scheduledAt < now || m.status === "ARCHIVED");

  return (
    <div className="space-y-6">
      <Card padded={false} className="p-3 sm:p-3.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings & circulars…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="ALL">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? "— " : ""}
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {(["ALL", "MEETING", "CIRCULAR"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "ALL" ? "All" : t === "MEETING" ? "Meetings" : "Circulars"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length > 0 && (
        <>
          <Card title="Upcoming" icon={CalendarClock}>
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarClock}>Nothing scheduled matches your filters.</EmptyState>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcoming.map((m) => (
                  <MeetingRow key={m.id} meeting={m} basePath={basePath} />
                ))}
              </ul>
            )}
          </Card>

          <Card title="Past & archived" icon={Archive}>
            {past.length === 0 ? (
              <EmptyState icon={Archive}>No past meetings match your filters.</EmptyState>
            ) : (
              <ul className="divide-y divide-slate-100">
                {past.map((m) => (
                  <MeetingRow key={m.id} meeting={m} basePath={basePath} />
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function MeetingRow({ meeting, basePath }: { meeting: Meeting; basePath: string }) {
  const Icon = meeting.type === "CIRCULAR" ? ScrollText : Video;
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <Link
        href={`${basePath}/meetings/${meeting.id}`}
        className="flex items-center justify-between gap-3 group -mx-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              meeting.type === "CIRCULAR" ? "bg-violet-50 text-violet-600" : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 truncate transition-colors">
              {meeting.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {format(meeting.scheduledAt, "EEE, MMM d, yyyy · h:mm a")}
              {meeting.category ? ` · ${meeting.category.name}` : ""} · {meeting.documents.length} document
              {meeting.documents.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge status={meeting.status} dot={meeting.status === "LIVE"}>
            {meeting.status}
          </Badge>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </Link>
    </li>
  );
}

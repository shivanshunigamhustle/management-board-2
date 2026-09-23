"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CalendarClock, Video, ScrollText } from "lucide-react";
import { Badge, EmptyState, Card, SectionHeading, Button } from "@/components/ui";

type Meeting = { id: string; title: string; scheduledAt: Date; type: string; status: string };

export function CalendarView({
  role,
  meetings,
}: {
  role: "MEMBER" | "ADMIN";
  meetings: Meeting[];
}) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const basePath = role === "ADMIN" ? "/admin" : "/member";

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const key = format(m.scheduledAt, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [meetings]);

  const selectedMeetings = selected ? meetingsByDay.get(format(selected, "yyyy-MM-dd")) ?? [] : [];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Calendar"
        description="Every scheduled meeting and circular, at a glance."
        action={
          role === "ADMIN" ? (
            <Button href="/admin/meetings/new" icon={Plus}>
              Schedule new
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold text-slate-900">{format(cursor, "MMMM yyyy")}</h2>
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 mb-1.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayMeetings = meetingsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            const isSelected = selected && isSameDay(day, selected);
            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                aria-label={`${format(day, "EEEE, MMMM d, yyyy")}${dayMeetings.length ? ` — ${dayMeetings.length} meeting${dayMeetings.length === 1 ? "" : "s"}` : ""}`}
                className={`aspect-square rounded-xl border text-left p-1.5 text-xs transition-colors ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : isToday(day)
                    ? "border-indigo-200 bg-indigo-50/50 text-slate-900"
                    : "border-transparent hover:bg-slate-50 text-slate-900"
                } ${!inMonth ? "opacity-30" : ""}`}
              >
                <div className={isToday(day) && !isSelected ? "font-semibold text-indigo-600" : ""}>{format(day, "d")}</div>
                {dayMeetings.length > 0 && (
                  <div className="mt-1 flex gap-0.5">
                    {dayMeetings.slice(0, 3).map((m) => (
                      <span
                        key={m.id}
                        className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card title={format(selected, "EEEE, MMM d, yyyy")} icon={CalendarClock}>
          {selectedMeetings.length === 0 ? (
            <EmptyState icon={CalendarClock}>Nothing scheduled this day.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100">
              {selectedMeetings.map((m) => {
                const Icon = m.type === "CIRCULAR" ? ScrollText : Video;
                return (
                  <li key={m.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`${basePath}/meetings/${m.id}`}
                      className="flex items-center justify-between gap-3 group -mx-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        {format(m.scheduledAt, "h:mm a")} · {m.title}
                      </span>
                      <Badge status={m.type}>{m.type === "CIRCULAR" ? "Circular" : "Meeting"}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

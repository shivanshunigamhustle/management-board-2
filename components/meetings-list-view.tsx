import { Plus, CalendarClock } from "lucide-react";
import { getMeetingsList, runScheduledArchival } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { Card, SectionHeading, Button } from "@/components/ui";
import { MeetingsFilterList } from "@/components/meetings-filter-list";

export async function MeetingsListView({ role }: { role: "MEMBER" | "ADMIN" }) {
  await runScheduledArchival();
  const [meetings, categories] = await Promise.all([
    getMeetingsList(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const basePath = role === "ADMIN" ? "/admin" : "/member";

  const now = new Date();
  const upcoming = meetings.filter((m) => m.scheduledAt >= now && m.status !== "ARCHIVED");
  const past = meetings.filter((m) => m.scheduledAt < now || m.status === "ARCHIVED");

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Meetings & Circulars"
        description="Every meeting and circular resolution, organized by category."
        action={
          role === "ADMIN" ? (
            <Button href="/admin/meetings/new" icon={Plus}>
              New meeting / circular
            </Button>
          ) : undefined
        }
      />

      <MeetingsFilterList meetings={meetings} categories={categories} basePath={basePath} />

      {upcoming.length === 0 && past.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <CalendarClock className="h-5 w-5 text-slate-400" strokeWidth={1.75} />
            </div>
            <p className="text-sm text-slate-400">No meetings or circulars yet.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, ListChecks, FileText, ChevronRight, Video, FileStack } from "lucide-react";
import { auth } from "@/auth";
import { getMemberDashboardData } from "@/lib/data";
import { Card, Badge, EmptyState, StatTile, SectionHeading } from "@/components/ui";

export default async function MemberDashboard() {
  const session = await auth();
  const user = session!.user as { id: string; name?: string | null };
  const { upcomingMeetings, actionItems, recentDocuments } = await getMemberDashboardData(user.id);

  return (
    <div className="space-y-6">
      <SectionHeading
        title={`Welcome back, ${user.name?.split(" ")[0]}`}
        description="Here's what needs your attention across upcoming meetings and action items."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Upcoming meetings" value={upcomingMeetings.length} icon={CalendarClock} accent="indigo" />
        <StatTile label="Open action items" value={actionItems.length} icon={ListChecks} accent="amber" />
        <StatTile label="Recent documents" value={recentDocuments.length} icon={FileText} accent="slate" />
      </div>

      <Card
        title="Upcoming meetings"
        icon={CalendarClock}
        action={
          <Link href="/member/meetings" className="flex items-center gap-0.5 text-xs font-medium text-slate-500 hover:text-slate-900">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {upcomingMeetings.length === 0 ? (
          <EmptyState icon={CalendarClock}>No upcoming meetings scheduled.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcomingMeetings.map((m) => (
              <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/member/meetings/${m.id}`} className="flex items-center justify-between gap-3 group -mx-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Video className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 truncate transition-colors">{m.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {format(m.scheduledAt, "EEE, MMM d · h:mm a")} {m.category ? `· ${m.category.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge status={m.type}>{m.type === "CIRCULAR" ? "Circular" : "Meeting"}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Your pending action items" icon={ListChecks}>
        {actionItems.length === 0 ? (
          <EmptyState icon={ListChecks}>Nothing outstanding — you&apos;re all caught up.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {actionItems.map((item) => (
              <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 truncate">{item.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.meeting.title}
                    {item.dueDate ? ` · due ${format(item.dueDate, "MMM d")}` : ""}
                  </p>
                </div>
                <Badge status={item.status}>{item.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Recently shared documents" icon={FileStack}>
        {recentDocuments.length === 0 ? (
          <EmptyState icon={FileText}>No documents shared yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentDocuments.map((doc) => (
              <li key={doc.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.meeting?.title ?? "Library"} · v{doc.version}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{format(doc.updatedAt, "MMM d")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

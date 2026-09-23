import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, ListChecks, Users, Radio, Plus, BarChart3, Activity, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { getAdminDashboardData } from "@/lib/data";
import { Card, Badge, EmptyState, StatTile, SectionHeading, Button } from "@/components/ui";
import { AttendanceChart } from "@/components/attendance-chart";

export default async function AdminDashboard() {
  const session = await auth();
  const user = session!.user as { name?: string | null };
  const { meetingsNeedingPacks, openActionItems, recentActivity, attendanceSummary, memberCount, liveCount } =
    await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        title={`Welcome back, ${user.name?.split(" ")[0]}`}
        description="Admin & Secretary overview"
        action={
          <Button href="/admin/meetings/new" icon={Plus}>
            New meeting / circular
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Meetings upcoming" value={meetingsNeedingPacks.length} icon={CalendarClock} accent="indigo" />
        <StatTile label="Open action items" value={openActionItems.length} icon={ListChecks} accent="amber" />
        <StatTile label="Live right now" value={liveCount} icon={Radio} accent={liveCount > 0 ? "red" : "slate"} />
        <StatTile label="Board members" value={memberCount} icon={Users} accent="emerald" />
      </div>

      <Card title="Meetings needing packs circulated" icon={CalendarClock}>
        {meetingsNeedingPacks.length === 0 ? (
          <EmptyState icon={CalendarClock}>Nothing scheduled right now.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {meetingsNeedingPacks.map((m) => (
              <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/admin/meetings/${m.id}/agenda`}
                  className="flex items-center justify-between gap-3 group -mx-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 truncate transition-colors">{m.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {format(m.scheduledAt, "EEE, MMM d · h:mm a")} · {m.documents.length} document
                      {m.documents.length === 1 ? "" : "s"} attached
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={m.status}>{m.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Attendance snapshot" icon={BarChart3}>
        <AttendanceChart data={attendanceSummary} />
      </Card>

      <Card title="Open action items across members" icon={ListChecks}>
        {openActionItems.length === 0 ? (
          <EmptyState icon={ListChecks}>All action items resolved.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {openActionItems.map((item) => (
              <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 truncate">{item.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.assignedTo.name} · {item.meeting.title}
                  </p>
                </div>
                <Badge status={item.status}>{item.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Recent activity" icon={Activity}>
        {recentActivity.length === 0 ? (
          <EmptyState icon={Activity}>No activity logged yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((log) => (
              <li key={log.id} className="py-2.5 first:pt-0 last:pb-0 text-sm text-slate-600 flex items-center justify-between gap-3">
                <span>
                  <span className="font-medium text-slate-900">{log.user.name}</span>{" "}
                  {log.action.toLowerCase().replaceAll("_", " ")}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{format(log.createdAt, "MMM d, h:mm a")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

import { format } from "date-fns";
import { BarChart3, PieChart, FileSearch, Activity, DatabaseBackup, Download, TrendingUp, ListChecks, Percent } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, SectionHeading, StatTile, Button } from "@/components/ui";
import { AttendanceChart } from "@/components/attendance-chart";
import { ActionItemChart } from "@/components/action-item-chart";
import { BackupPanel } from "@/components/backup-panel";

export default async function ReportsPage() {
  const [meetings, actionItems, documentLogs, auditTrail] = await Promise.all([
    prisma.meeting.findMany({ where: { status: "COMPLETED" }, include: { attendances: true } }),
    prisma.actionItem.findMany(),
    prisma.activityLog.findMany({
      where: { targetType: "DOCUMENT" },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { user: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { user: true },
    }),
  ]);

  const attendanceSummary = meetings.map((m) => ({
    title: m.title,
    present: m.attendances.filter((a) => a.status === "PRESENT").length,
    total: m.attendances.length,
  }));

  const totalSeats = attendanceSummary.reduce((sum, m) => sum + m.total, 0);
  const totalPresent = attendanceSummary.reduce((sum, m) => sum + m.present, 0);
  const avgAttendance = totalSeats > 0 ? Math.round((totalPresent / totalSeats) * 100) : 0;

  const openCount = actionItems.filter((a) => a.status === "OPEN").length;
  const doneCount = actionItems.filter((a) => a.status === "DONE").length;
  const completionRate = openCount + doneCount > 0 ? Math.round((doneCount / (openCount + doneCount)) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Reports & Analytics"
        description="Attendance, action-item completion, and audit visibility across the board."
        action={
          <Button variant="secondary" icon={Download}>
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Avg. attendance" value={`${avgAttendance}%`} icon={Percent} accent="indigo" />
        <StatTile label="Action item completion" value={`${completionRate}%`} icon={TrendingUp} accent="emerald" />
        <StatTile label="Open action items" value={openCount} icon={ListChecks} accent="amber" />
        <StatTile label="Completed meetings" value={meetings.length} icon={BarChart3} accent="slate" />
      </div>

      <Card title="Attendance by meeting" icon={BarChart3}>
        <AttendanceChart data={attendanceSummary} />
      </Card>

      <Card title="Action item completion" icon={PieChart}>
        <ActionItemChart open={openCount} done={doneCount} />
      </Card>

      <Card title="Document access log" icon={FileSearch}>
        {documentLogs.length === 0 ? (
          <EmptyState icon={FileSearch}>No document activity logged yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {documentLogs.map((log) => (
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

      <Card title="Full audit trail" icon={Activity}>
        {auditTrail.length === 0 ? (
          <EmptyState icon={Activity}>No activity logged yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto scrollbar-thin">
            {auditTrail.map((log) => (
              <li key={log.id} className="py-2 first:pt-0 last:pb-0 text-xs text-slate-600 flex items-center justify-between gap-3">
                <span>
                  <span className="font-medium text-slate-900">{log.user.name}</span> ·{" "}
                  {log.action.toLowerCase().replaceAll("_", " ")} · {log.targetType.toLowerCase()}
                </span>
                <span className="text-slate-400 shrink-0">{format(log.createdAt, "MMM d, h:mm a")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Backups" icon={DatabaseBackup}>
        <BackupPanel />
      </Card>
    </div>
  );
}

import { format } from "date-fns";
import { UserPlus, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Badge, SectionHeading, StatTile } from "@/components/ui";
import { AddMemberForm } from "@/components/add-member-form";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function AdminMembersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { activityLogs: { orderBy: { createdAt: "desc" }, take: 3 } },
  });

  const LICENSE_SEATS = 30;
  const seatsUsed = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <SectionHeading title="Members & Accounts" description="Manage board member and administrator access." />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatTile label="Total members" value={users.length} icon={Users} accent="indigo" />
        <StatTile label="Administrators" value={adminCount} icon={ShieldCheck} accent="emerald" />
        <StatTile label="Licensed seats used" value={`${seatsUsed} / ${LICENSE_SEATS}`} icon={UserPlus} accent={seatsUsed >= LICENSE_SEATS ? "red" : "slate"} />
      </div>

      <Card title="Add a member" icon={UserPlus}>
        {seatsUsed >= LICENSE_SEATS ? (
          <p className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            All {LICENSE_SEATS} licensed seats are in use. Remove a member or contact your vendor to add seats.
          </p>
        ) : (
          <AddMemberForm />
        )}
      </Card>

      <Card title="All members" icon={Users}>
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>
                <Badge status={u.role}>{u.role === "ADMIN" ? "Administrator" : "Board Member"}</Badge>
              </div>
              {u.activityLogs.length > 0 && (
                <ul className="mt-2 ml-12 space-y-0.5">
                  {u.activityLogs.map((log) => (
                    <li key={log.id} className="text-[11px] text-slate-400">
                      {format(log.createdAt, "MMM d, h:mm a")} · {log.action.toLowerCase().replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

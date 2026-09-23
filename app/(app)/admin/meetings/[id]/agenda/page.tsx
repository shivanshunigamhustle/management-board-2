import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { getMeetingDetail } from "@/lib/data";
import { Card, Badge } from "@/components/ui";
import { AgendaBuilder } from "@/components/agenda-builder";

export default async function AgendaBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await getMeetingDetail(id);
  if (!meeting) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/meetings/${meeting.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to meeting
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <Badge status={meeting.type}>{meeting.type === "CIRCULAR" ? "Circular" : "Meeting"}</Badge>
          <Badge status={meeting.status}>{meeting.status}</Badge>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mt-1 tracking-tight">{meeting.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{format(meeting.scheduledAt, "EEEE, MMM d, yyyy · h:mm a")}</p>
      </div>

      <Card title="Agenda builder" icon={ListOrdered}>
        <AgendaBuilder meetingId={meeting.id} items={meeting.agendaItems} documents={meeting.documents} />
      </Card>
    </div>
  );
}

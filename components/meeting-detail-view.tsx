import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Tag,
  ListOrdered,
  FileStack,
  MessageSquare,
  Vote as VoteIcon,
  Users,
  ListChecks,
  ScrollText,
  Pencil,
  Paperclip,
  Video,
} from "lucide-react";
import { getMeetingDetail } from "@/lib/data";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { VotePanel } from "@/components/vote-panel";
import { ActionItemsPanel } from "@/components/action-items-panel";
import { DocumentPack } from "@/components/document-pack";
import { MinutesPanel } from "@/components/minutes-panel";
import { AttendancePanel } from "@/components/attendance-panel";
import { AddActionItemForm } from "@/components/add-action-item-form";
import { ArchiveToggle } from "@/components/archive-toggle";
import { ChatPanel } from "@/components/chat-panel";

export async function MeetingDetailView({
  meetingId,
  role,
  currentUserId,
}: {
  meetingId: string;
  role: "MEMBER" | "ADMIN";
  currentUserId: string;
}) {
  const meeting = await getMeetingDetail(meetingId);
  if (!meeting) notFound();

  const isAdmin = role === "ADMIN";
  const allUsers = isAdmin && meeting.attendances.length > 0 ? meeting.attendances.map((a) => a.user) : [];
  const currentUserName = meeting.attendances.find((a) => a.user.id === currentUserId)?.user.name ?? "You";
  const showVideoControls = meeting.type === "MEETING" && !!meeting.joinLink;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge status={meeting.type}>{meeting.type === "CIRCULAR" ? "Circular" : "Meeting"}</Badge>
              <Badge status={meeting.status} dot={meeting.status === "LIVE"}>
                {meeting.status}
              </Badge>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-slate-400" strokeWidth={2} />
                {format(meeting.scheduledAt, "EEEE, MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" strokeWidth={2} />
                {format(meeting.scheduledAt, "h:mm a")}
              </span>
              {meeting.category && (
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  {meeting.category.name}
                </span>
              )}
            </div>
            {meeting.description && <p className="text-sm text-slate-600 mt-3 max-w-xl leading-relaxed">{meeting.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {meeting.joinLink && (
              <a href={meeting.joinLink} target="_blank" rel="noreferrer">
                <Button icon={Video}>Join meeting</Button>
              </a>
            )}
            {isAdmin && (
              <div className="flex gap-2">
                <Link href={`/admin/meetings/${meeting.id}/agenda`}>
                  <Button variant="secondary" size="sm" icon={Pencil}>
                    Edit agenda
                  </Button>
                </Link>
                <ArchiveToggle meetingId={meeting.id} status={meeting.status} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Agenda" icon={ListOrdered}>
            {meeting.agendaItems.length === 0 ? (
              <EmptyState icon={ListOrdered}>No agenda items yet.</EmptyState>
            ) : (
              <ol className="space-y-3">
                {meeting.agendaItems.map((item, idx) => (
                  <li key={item.id} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                      {idx + 1}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-slate-900">{item.title}</p>
                      {item.document && (
                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Paperclip className="h-3 w-3" /> {item.document.fileName}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Document pack" icon={FileStack}>
            <DocumentPack
              meetingId={meeting.id}
              documents={meeting.documents}
              currentUserName={currentUserName}
              isAdmin={isAdmin}
            />
          </Card>

          {meeting.resolutions.length > 0 && (
            <Card title="Voting" icon={VoteIcon}>
              <div className="space-y-4">
                {meeting.resolutions.map((r) => {
                  const tally = { FOR: 0, AGAINST: 0, ABSTAIN: 0 };
                  r.votes.forEach((v) => {
                    tally[v.choice as "FOR" | "AGAINST" | "ABSTAIN"] += 1;
                  });
                  const mine = r.votes.find((v) => v.userId === currentUserId);
                  return (
                    <VotePanel
                      key={r.id}
                      resolutionId={r.id}
                      meetingId={meeting.id}
                      text={r.text}
                      tally={tally}
                      myChoice={mine?.choice as "FOR" | "AGAINST" | "ABSTAIN" | undefined}
                    />
                  );
                })}
              </div>
            </Card>
          )}

          <Card
            title="Action items"
            icon={ListChecks}
            action={isAdmin ? <AddActionItemForm meetingId={meeting.id} users={allUsers} /> : undefined}
          >
            <ActionItemsPanel meetingId={meeting.id} items={meeting.actionItems} currentUserId={currentUserId} />
          </Card>

          <Card title="Minutes" icon={ScrollText}>
            <MinutesPanel
              meetingId={meeting.id}
              meetingTitle={meeting.title}
              initialContent={meeting.minutes?.content ?? ""}
              finalizedAt={meeting.minutes?.finalizedAt ?? null}
              isAdmin={isAdmin}
            />
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          {showVideoControls && (
            <Card title="Meeting chat" icon={MessageSquare}>
              <ChatPanel meetingId={meeting.id} messages={meeting.chatMessages} />
            </Card>
          )}

          <Card title="Attendance" icon={Users}>
            <AttendancePanel
              meetingId={meeting.id}
              attendances={meeting.attendances}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              showVideoControls={showVideoControls}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

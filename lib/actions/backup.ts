"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/data";

export async function runBackupNow(): Promise<{ fileName: string; at: string; dataJson: string }> {
  const session = await auth();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== "ADMIN") throw new Error("Not authorized");

  const [
    users,
    categories,
    meetings,
    agendaItems,
    documents,
    comments,
    chatMessages,
    resolutions,
    votes,
    actionItems,
    attendances,
    minutes,
    activityLog,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        offlineMode: true,
        lastSyncedAt: true,
        createdAt: true,
      },
    }),
    prisma.category.findMany(),
    prisma.meeting.findMany(),
    prisma.agendaItem.findMany(),
    prisma.document.findMany({
      select: {
        id: true,
        meetingId: true,
        uploadedById: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        mimeType: true,
        version: true,
        restricted: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    prisma.comment.findMany(),
    prisma.chatMessage.findMany(),
    prisma.resolution.findMany(),
    prisma.vote.findMany(),
    prisma.actionItem.findMany(),
    prisma.meetingAttendance.findMany(),
    prisma.minutes.findMany(),
    prisma.activityLog.findMany(),
  ]);

  const at = new Date().toISOString();
  const snapshot = {
    exportedAt: at,
    exportedBy: user.id,
    users,
    categories,
    meetings,
    agendaItems,
    documents,
    comments,
    chatMessages,
    resolutions,
    votes,
    actionItems,
    attendances,
    minutes,
    activityLog,
  };

  await logActivity(user.id, "RUN_BACKUP", "SYSTEM");

  const timestamp = at.replace(/[:.]/g, "-");
  return { fileName: `board-portal-backup-${timestamp}.json`, at, dataJson: JSON.stringify(snapshot, null, 2) };
}

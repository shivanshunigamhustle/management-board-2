"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/data";

async function requireUser() {
  const session = await auth();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function castVote(resolutionId: string, meetingId: string, choice: "FOR" | "AGAINST" | "ABSTAIN") {
  const user = await requireUser();

  const attendance = await prisma.meetingAttendance.findUnique({
    where: { meetingId_userId: { meetingId, userId: user.id } },
  });
  if (attendance?.meetingRole === "OBSERVER") {
    throw new Error("Observers are not permitted to vote on this meeting's resolutions.");
  }

  await prisma.vote.upsert({
    where: { resolutionId_userId: { resolutionId, userId: user.id } },
    update: { choice, castAt: new Date() },
    create: { resolutionId, userId: user.id, choice },
  });

  await logActivity(user.id, "CAST_VOTE", "RESOLUTION", resolutionId);
  revalidatePath(`/member/meetings/${meetingId}`);
  revalidatePath(`/admin/meetings/${meetingId}`);
}

export async function toggleActionItem(actionItemId: string, meetingId: string) {
  const user = await requireUser();
  const item = await prisma.actionItem.findUnique({ where: { id: actionItemId } });
  if (!item) return;

  await prisma.actionItem.update({
    where: { id: actionItemId },
    data: { status: item.status === "DONE" ? "OPEN" : "DONE" },
  });

  await logActivity(user.id, "UPDATE_ACTION_ITEM", "ACTION_ITEM", actionItemId);
  revalidatePath(`/member/meetings/${meetingId}`);
  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath("/member/dashboard");
  revalidatePath("/admin/dashboard");
}

export async function signAttendance(meetingId: string) {
  const user = await requireUser();

  await prisma.meetingAttendance.upsert({
    where: { meetingId_userId: { meetingId, userId: user.id } },
    update: { status: "PRESENT", signedAt: new Date() },
    create: { meetingId, userId: user.id, status: "PRESENT", signedAt: new Date() },
  });

  await logActivity(user.id, "SIGN_ATTENDANCE", "MEETING", meetingId);
  revalidatePath(`/member/meetings/${meetingId}`);
  revalidatePath(`/admin/meetings/${meetingId}`);
}

export async function approveDocument(documentId: string, meetingId: string, password: string) {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) throw new Error("User not found");

  const passwordMatches = await bcrypt.compare(password, dbUser.passwordHash);
  if (!passwordMatches) {
    throw new Error("Re-authentication failed: incorrect password.");
  }

  await logActivity(user.id, "ESIGN_APPROVE", "DOCUMENT", documentId);
  revalidatePath(`/member/meetings/${meetingId}`);
  revalidatePath(`/admin/meetings/${meetingId}`);
}

export async function finalizeMinutes(meetingId: string, content: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  await prisma.minutes.upsert({
    where: { meetingId },
    update: { content, finalizedAt: new Date() },
    create: { meetingId, content, finalizedAt: new Date() },
  });

  await prisma.meeting.update({ where: { id: meetingId }, data: { status: "COMPLETED" } });
  await logActivity(user.id, "FINALIZE_MINUTES", "MEETING", meetingId);
  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath(`/member/meetings/${meetingId}`);
}

export async function saveDraftMinutes(meetingId: string, content: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  await prisma.minutes.upsert({
    where: { meetingId },
    update: { content },
    create: { meetingId, content },
  });

  revalidatePath(`/admin/meetings/${meetingId}`);
}

export async function sendChatMessage(meetingId: string, content: string) {
  const user = await requireUser();
  if (!content.trim()) return;

  await prisma.chatMessage.create({
    data: { meetingId, userId: user.id, content: content.trim() },
  });

  revalidatePath(`/member/meetings/${meetingId}`);
  revalidatePath(`/admin/meetings/${meetingId}`);
}

export async function setMeetingRole(meetingId: string, userId: string, meetingRole: "PRESENTER" | "VOTER" | "OBSERVER") {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  await prisma.meetingAttendance.update({
    where: { meetingId_userId: { meetingId, userId } },
    data: { meetingRole },
  });

  await logActivity(user.id, "SET_MEETING_ROLE", "MEETING", meetingId);
  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath(`/member/meetings/${meetingId}`);
}

export async function createMeeting(data: {
  title: string;
  type: "MEETING" | "CIRCULAR";
  scheduledAt: string;
  categoryId?: string;
  description?: string;
  joinLink?: string;
  scheduledArchiveAt?: string;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  const members = await prisma.user.findMany();

  const meeting = await prisma.meeting.create({
    data: {
      title: data.title,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt),
      categoryId: data.categoryId || undefined,
      description: data.description,
      joinLink: data.joinLink,
      scheduledArchiveAt: data.scheduledArchiveAt ? new Date(data.scheduledArchiveAt) : undefined,
      status: "SCHEDULED",
      attendances: {
        create: members.map((m) => ({ userId: m.id, status: "INVITED" as const })),
      },
    },
  });

  await logActivity(user.id, "SCHEDULE_MEETING", "MEETING", meeting.id);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/meetings");
  revalidatePath("/member/meetings");
  return meeting.id;
}

export async function addAgendaItem(meetingId: string, title: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  const count = await prisma.agendaItem.count({ where: { meetingId } });
  await prisma.agendaItem.create({
    data: { meetingId, title, order: count + 1 },
  });

  revalidatePath(`/admin/meetings/${meetingId}/agenda`);
  revalidatePath(`/member/meetings/${meetingId}`);
}

export async function removeAgendaItem(agendaItemId: string, meetingId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  await prisma.agendaItem.delete({ where: { id: agendaItemId } });

  revalidatePath(`/admin/meetings/${meetingId}/agenda`);
  revalidatePath(`/member/meetings/${meetingId}`);
}

export async function moveAgendaItem(meetingId: string, agendaItemId: string, direction: "up" | "down") {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  const items = await prisma.agendaItem.findMany({
    where: { meetingId },
    orderBy: { order: "asc" },
  });

  const idx = items.findIndex((i) => i.id === agendaItemId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= items.length) return;

  const a = items[idx];
  const b = items[swapIdx];

  await prisma.$transaction([
    prisma.agendaItem.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.agendaItem.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/meetings/${meetingId}/agenda`);
  revalidatePath(`/member/meetings/${meetingId}`);
}

export async function publishAgenda(meetingId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  await logActivity(user.id, "CIRCULATE_PACK", "MEETING", meetingId);
  revalidatePath(`/admin/meetings/${meetingId}/agenda`);
  revalidatePath(`/member/meetings/${meetingId}`);
}

export async function addActionItem(meetingId: string, assignedToId: string, description: string, dueDate?: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  await prisma.actionItem.create({
    data: {
      meetingId,
      assignedToId,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: "OPEN",
    },
  });

  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath(`/member/meetings/${meetingId}`);
  revalidatePath("/member/dashboard");
  revalidatePath("/admin/dashboard");
}

export async function archiveMeeting(meetingId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: meeting?.status === "ARCHIVED" ? "COMPLETED" : "ARCHIVED" },
  });

  await logActivity(user.id, "ARCHIVE_MEETING", "MEETING", meetingId);
  revalidatePath("/admin/meetings");
  revalidatePath("/member/meetings");
}

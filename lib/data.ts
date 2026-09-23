import { prisma } from "@/lib/prisma";

export async function getMemberDashboardData(userId: string) {
  const [upcomingMeetings, actionItems, recentDocuments] = await Promise.all([
    prisma.meeting.findMany({
      where: { scheduledAt: { gte: new Date() }, status: { not: "ARCHIVED" } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { category: true },
    }),
    prisma.actionItem.findMany({
      where: { assignedToId: userId, status: "OPEN" },
      orderBy: { dueDate: "asc" },
      include: { meeting: true },
    }),
    prisma.document.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { meeting: true },
    }),
  ]);

  return { upcomingMeetings, actionItems, recentDocuments };
}

export async function getAdminDashboardData() {
  const [meetingsNeedingPacks, openActionItems, recentActivity, allMeetings, memberCount, liveCount] =
    await Promise.all([
      prisma.meeting.findMany({
        where: { scheduledAt: { gte: new Date() }, status: { not: "ARCHIVED" } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: { documents: true, category: true },
      }),
      prisma.actionItem.findMany({
        where: { status: "OPEN" },
        orderBy: { dueDate: "asc" },
        take: 8,
        include: { assignedTo: true, meeting: true },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: true },
      }),
      prisma.meeting.findMany({
        include: { attendances: true },
      }),
      prisma.user.count(),
      prisma.meeting.count({ where: { status: "LIVE" } }),
    ]);

  const attendanceSummary = allMeetings
    .filter((m) => m.status === "COMPLETED")
    .map((m) => ({
      title: m.title,
      present: m.attendances.filter((a) => a.status === "PRESENT").length,
      total: m.attendances.length,
    }));

  return { meetingsNeedingPacks, openActionItems, recentActivity, attendanceSummary, memberCount, liveCount };
}

export async function getAllUsers() {
  return prisma.user.findMany({ orderBy: { name: "asc" } });
}

export async function getMeetingsList() {
  return prisma.meeting.findMany({
    orderBy: { scheduledAt: "desc" },
    include: { category: true, documents: true },
  });
}

export async function getMeetingDetail(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      category: true,
      agendaItems: { orderBy: { order: "asc" }, include: { document: true } },
      documents: {
        orderBy: { updatedAt: "desc" },
        include: { comments: { orderBy: { createdAt: "asc" }, include: { user: true } } },
      },
      resolutions: { include: { votes: true } },
      actionItems: { include: { assignedTo: true } },
      attendances: { include: { user: true } },
      minutes: true,
      chatMessages: { orderBy: { createdAt: "asc" }, include: { user: true } },
    },
  });
}

export async function runScheduledArchival() {
  await prisma.meeting.updateMany({
    where: {
      scheduledArchiveAt: { lte: new Date() },
      status: { not: "ARCHIVED" },
    },
    data: { status: "ARCHIVED" },
  });
}

export async function logActivity(userId: string, action: string, targetType: string, targetId?: string) {
  await prisma.activityLog.create({
    data: { userId, action, targetType, targetId },
  });
}

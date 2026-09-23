import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar-view";

export default async function AdminCalendarPage() {
  const meetings = await prisma.meeting.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { scheduledAt: "asc" },
  });
  return <CalendarView role="ADMIN" meetings={meetings} />;
}

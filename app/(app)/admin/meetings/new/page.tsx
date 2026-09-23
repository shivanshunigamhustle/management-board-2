import { prisma } from "@/lib/prisma";
import { Card, SectionHeading } from "@/components/ui";
import { NewMeetingForm } from "@/components/new-meeting-form";

export default async function NewMeetingPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Schedule a meeting or circular"
        description="Invite the full board, set an agenda, and attach the opening pack."
      />
      <Card>
        <NewMeetingForm categories={categories} />
      </Card>
    </div>
  );
}

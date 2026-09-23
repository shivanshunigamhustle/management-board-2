import { auth } from "@/auth";
import { MeetingDetailView } from "@/components/meeting-detail-view";

export default async function MemberMeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user as { id: string };

  return <MeetingDetailView meetingId={id} role="MEMBER" currentUserId={user.id} />;
}

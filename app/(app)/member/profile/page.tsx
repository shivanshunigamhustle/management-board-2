import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile-view";

export default async function MemberProfilePage() {
  const session = await auth();
  const sessionUser = session!.user as { id: string; name?: string | null; email?: string | null };
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

  return (
    <ProfileView
      name={sessionUser.name ?? ""}
      email={sessionUser.email ?? ""}
      role="MEMBER"
      offlineMode={user?.offlineMode ?? false}
      lastSyncedAt={user?.lastSyncedAt ?? null}
    />
  );
}

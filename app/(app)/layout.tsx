import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role === "ADMIN" ? "ADMIN" : "MEMBER";
  const name = session.user.name ?? "User";

  return (
    <AppShell role={role} name={name}>
      {children}
    </AppShell>
  );
}

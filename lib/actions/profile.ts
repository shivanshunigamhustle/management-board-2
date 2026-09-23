"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/data";
import { validatePassword } from "@/lib/password-policy";

export async function setOfflineMode(offlineMode: boolean) {
  const session = await auth();
  const user = session?.user as { id: string } | undefined;
  if (!user) throw new Error("Not authenticated");

  await prisma.user.update({ where: { id: user.id }, data: { offlineMode } });
  await logActivity(user.id, offlineMode ? "ENABLE_OFFLINE_MODE" : "DISABLE_OFFLINE_MODE", "USER", user.id);
}

export async function syncNow() {
  const session = await auth();
  const user = session?.user as { id: string } | undefined;
  if (!user) throw new Error("Not authenticated");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastSyncedAt: new Date() },
  });
  await logActivity(user.id, "SYNC_DATA", "USER", user.id);
  return updated.lastSyncedAt;
}

export async function changePasswordAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  const user = session?.user as { id: string } | undefined;
  if (!user) return { error: "Not authenticated." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const policyError = validatePassword(newPassword);
  if (policyError) return { error: policyError };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "User not found." };

  const matches = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!matches) return { error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await logActivity(user.id, "CHANGE_PASSWORD", "USER", user.id);

  return { success: true };
}

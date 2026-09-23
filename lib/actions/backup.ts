"use server";

import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { logActivity } from "@/lib/data";

export async function runBackupNow(): Promise<{ fileName: string; at: string }> {
  const session = await auth();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== "ADMIN") throw new Error("Not authorized");

  const backupsDir = path.join(process.cwd(), "backups");
  await mkdir(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `board-portal-${timestamp}.db`;
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");

  await copyFile(dbPath, path.join(backupsDir, fileName));
  await logActivity(user.id, "RUN_BACKUP", "SYSTEM");

  return { fileName, at: new Date().toISOString() };
}

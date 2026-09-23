"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/data";

export async function addDocumentComment(documentId: string, content: string, meetingId?: string) {
  const session = await auth();
  const user = session?.user as { id: string } | undefined;
  if (!user) throw new Error("Not authenticated");
  if (!content.trim()) return;

  await prisma.comment.create({
    data: { documentId, userId: user.id, content: content.trim() },
  });

  await logActivity(user.id, "COMMENT_DOCUMENT", "DOCUMENT", documentId);
  revalidatePath("/admin/documents");
  revalidatePath("/member/documents");
  if (meetingId) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath(`/member/meetings/${meetingId}`);
  }
}

export async function toggleDocumentRestricted(documentId: string, meetingId?: string) {
  const session = await auth();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== "ADMIN") throw new Error("Not authorized");

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return;

  await prisma.document.update({ where: { id: documentId }, data: { restricted: !doc.restricted } });
  await logActivity(user.id, "TOGGLE_DOCUMENT_RESTRICTED", "DOCUMENT", documentId);
  revalidatePath("/admin/documents");
  revalidatePath("/member/documents");
  if (meetingId) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath(`/member/meetings/${meetingId}`);
  }
}

export async function uploadDocument(formData: FormData) {
  const session = await auth();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "ADMIN") throw new Error("Not authorized");

  const file = formData.get("file") as File | null;
  const meetingId = String(formData.get("meetingId") ?? "") || undefined;
  if (!file || file.size === 0) throw new Error("No file provided");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, safeName), buffer);

  const fileType = file.name.split(".").pop()?.toUpperCase() ?? "FILE";

  let existing = null;
  if (meetingId) {
    existing = await prisma.document.findFirst({
      where: { meetingId, fileName: file.name },
    });
  }

  if (existing) {
    await prisma.document.update({
      where: { id: existing.id },
      data: { fileUrl: `/uploads/${safeName}`, version: existing.version + 1 },
    });
  } else {
    await prisma.document.create({
      data: {
        meetingId,
        uploadedById: user.id,
        fileName: file.name,
        fileUrl: `/uploads/${safeName}`,
        fileType,
      },
    });
  }

  await logActivity(user.id, "UPLOAD_DOCUMENT", "DOCUMENT", meetingId);
  revalidatePath("/admin/documents");
  revalidatePath("/member/documents");
  if (meetingId) {
    revalidatePath(`/admin/meetings/${meetingId}/agenda`);
    revalidatePath(`/member/meetings/${meetingId}`);
    revalidatePath(`/admin/meetings/${meetingId}`);
  }
}

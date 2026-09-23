import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });

  if (!doc || !doc.fileData) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType =
    doc.mimeType === "text/plain" ? "text/plain; charset=utf-8" : doc.mimeType ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(doc.fileData), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

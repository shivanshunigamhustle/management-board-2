import { format } from "date-fns";
import { Lock, FileStack, FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, Badge, SectionHeading } from "@/components/ui";
import { UploadPanel } from "@/components/upload-panel";
import { DocumentSearch } from "@/components/document-search";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
import { RestrictButton } from "@/components/restrict-button";
import { DocumentComments } from "@/components/document-comments";
import { fileTypeMeta } from "@/lib/file-icons";

export async function DocumentLibraryView({
  role,
  query,
}: {
  role: "MEMBER" | "ADMIN";
  query?: string;
}) {
  const session = await auth();
  const currentUserName = session?.user?.name ?? "You";

  const documents = await prisma.document.findMany({
    where: {
      ...(query ? { fileName: { contains: query } } : {}),
      ...(role === "MEMBER" ? { restricted: false } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { meeting: true, uploadedBy: true, comments: { orderBy: { createdAt: "asc" }, include: { user: true } } },
  });

  const grouped = new Map<string, typeof documents>();
  for (const doc of documents) {
    const key = doc.meeting?.title ?? "General library";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(doc);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Document Library"
        description={`${documents.length} document${documents.length === 1 ? "" : "s"} across ${grouped.size} folder${grouped.size === 1 ? "" : "s"}`}
        action={<DocumentSearch role={role} defaultValue={query} />}
      />

      {role === "ADMIN" && (
        <Card title="Upload a document" icon={FileStack}>
          <UploadPanel />
        </Card>
      )}

      {grouped.size === 0 ? (
        <Card>
          <EmptyState icon={FileStack}>No documents found.</EmptyState>
        </Card>
      ) : (
        [...grouped.entries()].map(([group, docs]) => (
          <Card key={group} title={group} icon={FolderOpen}>
            <ul className="divide-y divide-slate-100">
              {docs.map((doc) => {
                const fileMeta = fileTypeMeta(doc.fileType);
                const FileIcon = fileMeta.icon;
                return (
                  <li key={doc.id} className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <div className="flex items-center gap-3 min-w-[180px] flex-1 basis-[220px]">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fileMeta.className}`}>
                        <FileIcon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <DocumentViewerModal
                              fileName={doc.fileName}
                              fileUrl={doc.fileUrl}
                              restricted={doc.restricted}
                              viewerName={currentUserName}
                            />
                          </div>
                          {doc.restricted && (
                            <span className="shrink-0">
                              <Badge status="ARCHIVED">
                                <Lock className="h-2.5 w-2.5" /> Restricted
                              </Badge>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          v{doc.version} · uploaded by {doc.uploadedBy.name} · {format(doc.updatedAt, "MMM d, yyyy")}
                        </p>
                        <DocumentComments documentId={doc.id} comments={doc.comments} />
                      </div>
                    </div>
                    {role === "ADMIN" && <RestrictButton documentId={doc.id} restricted={doc.restricted} />}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { FileText, Lock, ShieldOff, CheckCircle2 } from "lucide-react";
import { toggleDocumentRestricted } from "@/lib/actions/documents";
import { EmptyState, Badge, Button } from "@/components/ui";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
import { ESignModal } from "@/components/esign-modal";
import { DocumentComments } from "@/components/document-comments";
import { fileTypeMeta } from "@/lib/file-icons";

export function DocumentPack({
  meetingId,
  documents,
  currentUserName,
  isAdmin,
}: {
  meetingId: string;
  documents: {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    version: number;
    restricted: boolean;
    updatedAt: Date;
    comments: { id: string; content: string; createdAt: Date; user: { name: string } }[];
  }[];
  currentUserName: string;
  isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [signed, setSigned] = useState<Record<string, boolean>>({});

  if (documents.length === 0) return <EmptyState icon={FileText}>No documents attached yet.</EmptyState>;

  return (
    <ul className="divide-y divide-slate-100">
      {documents.map((doc) => {
        const fileMeta = fileTypeMeta(doc.fileType);
        const FileIcon = fileMeta.icon;
        return (
          <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
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
                    v{doc.version} · updated {format(doc.updatedAt, "MMM d, h:mm a")}
                  </p>
                  <DocumentComments documentId={doc.id} meetingId={meetingId} comments={doc.comments} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={doc.restricted ? ShieldOff : Lock}
                    disabled={pending}
                    onClick={() => startTransition(() => toggleDocumentRestricted(doc.id, meetingId))}
                  >
                    {doc.restricted ? "Unrestrict" : "Restrict"}
                  </Button>
                )}
                {signed[doc.id] ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                  </span>
                ) : (
                  <ESignModal
                    documentId={doc.id}
                    meetingId={meetingId}
                    fileName={doc.fileName}
                    onSigned={() => setSigned((s) => ({ ...s, [doc.id]: true }))}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

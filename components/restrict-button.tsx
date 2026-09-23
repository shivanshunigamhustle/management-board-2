"use client";

import { useTransition } from "react";
import { Lock, ShieldOff } from "lucide-react";
import { toggleDocumentRestricted } from "@/lib/actions/documents";
import { Button } from "@/components/ui";

export function RestrictButton({ documentId, restricted }: { documentId: string; restricted: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={restricted ? ShieldOff : Lock}
      disabled={pending}
      onClick={() => startTransition(() => toggleDocumentRestricted(documentId))}
      className="shrink-0"
    >
      {restricted ? "Unrestrict" : "Restrict"}
    </Button>
  );
}

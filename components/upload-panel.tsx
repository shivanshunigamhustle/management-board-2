"use client";

import { useTransition, useRef } from "react";
import { Upload } from "lucide-react";
import { uploadDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui";

export function UploadPanel() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await uploadDocument(formData);
          formRef.current?.reset();
        })
      }
      className="flex flex-wrap items-center gap-2"
    >
      <input
        type="file"
        name="file"
        required
        className="text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700"
      />
      <Button type="submit" size="sm" icon={Upload} disabled={pending}>
        {pending ? "Uploading…" : "Upload to library"}
      </Button>
    </form>
  );
}

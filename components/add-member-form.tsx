"use client";

import { useRef, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { createUser } from "@/lib/actions/users";
import { Button } from "@/components/ui";

const inputClass =
  "rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

export function AddMemberForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-2">
      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            try {
              await createUser(formData);
              formRef.current?.reset();
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not add member.");
            }
          })
        }
        className="grid grid-cols-1 sm:grid-cols-4 gap-2"
      >
        <input name="name" required placeholder="Full name" className={inputClass} />
        <input name="email" type="email" required placeholder="Email" className={inputClass} />
        <select name="role" className={inputClass}>
          <option value="MEMBER">Board Member</option>
          <option value="ADMIN">Administrator</option>
        </select>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add member"}
        </Button>
      </form>
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
        </p>
      )}
    </div>
  );
}

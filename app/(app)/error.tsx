"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbUnreachable = /can't reach database server|PrismaClientInitializationError/i.test(error.message);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 animate-fade">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={2} />
        </div>
        <h2 className="mt-4 text-sm font-semibold text-slate-900">
          {isDbUnreachable ? "Couldn't reach the database" : "Something went wrong"}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {isDbUnreachable
            ? "The database took too long to respond — this can happen right after a period of inactivity. It usually resolves in a few seconds."
            : "An unexpected error occurred while loading this page."}
        </p>
        <Button className="mt-5 w-full" icon={RefreshCw} onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}

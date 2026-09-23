"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function DocumentSearch({ role, defaultValue }: { role: "MEMBER" | "ADMIN"; defaultValue?: string }) {
  const router = useRouter();
  const basePath = role === "ADMIN" ? "/admin/documents" : "/member/documents";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        router.push(q ? `${basePath}?q=${encodeURIComponent(String(q))}` : basePath);
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search documents…"
        className="rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm w-56 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
      />
    </form>
  );
}

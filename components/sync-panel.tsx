"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { setOfflineMode, syncNow } from "@/lib/actions/profile";
import { Button } from "@/components/ui";

export function SyncPanel({
  initialOffline,
  initialLastSynced,
}: {
  initialOffline: boolean;
  initialLastSynced: Date | null;
}) {
  const [offline, setOffline] = useState(initialOffline);
  const [lastSynced, setLastSynced] = useState(initialLastSynced);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-900 font-medium">Offline reading mode</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {offline
              ? "Working from your last downloaded packs — annotations sync once you reconnect."
              : "Live — changes sync immediately."}
          </p>
        </div>
        <button
          onClick={() =>
            startTransition(async () => {
              await setOfflineMode(!offline);
              setOffline(!offline);
            })
          }
          disabled={pending}
          role="switch"
          aria-checked={offline}
          aria-label="Offline reading mode"
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            offline ? "bg-amber-500" : "bg-emerald-600"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              offline ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{lastSynced ? `Last synced ${format(lastSynced, "MMM d, h:mm a")}` : "Never synced"}</span>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const t = await syncNow();
              setLastSynced(t ?? new Date());
            })
          }
        >
          Refresh / Sync now
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Mic, MicOff, UserX, UserCheck, Eye, EyeOff } from "lucide-react";
import { signAttendance, setMeetingRole } from "@/lib/actions/meetings";
import { Badge, Button } from "@/components/ui";

const ROLE_OPTIONS = ["PRESENTER", "VOTER", "OBSERVER"] as const;

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function AttendancePanel({
  meetingId,
  attendances,
  currentUserId,
  isAdmin,
  showVideoControls,
}: {
  meetingId: string;
  attendances: {
    id: string;
    status: string;
    signedAt: Date | null;
    meetingRole: string;
    user: { id: string; name: string };
  }[];
  currentUserId: string;
  isAdmin: boolean;
  showVideoControls: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const mine = attendances.find((a) => a.user.id === currentUserId);

  return (
    <div className="space-y-3">
      {!isAdmin && mine && mine.status !== "PRESENT" && (
        <Button size="sm" icon={UserCheck} disabled={pending} onClick={() => startTransition(() => signAttendance(meetingId))}>
          Mark myself present
        </Button>
      )}
      <ul className="divide-y divide-slate-100">
        {attendances.map((a) => (
          <li key={a.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                {initials(a.user.name)}
              </div>
              <div className="min-w-0">
                <span className={`block text-sm truncate ${removed[a.id] ? "text-slate-300 line-through" : "text-slate-900"}`}>
                  {a.user.name}
                </span>
                {isAdmin ? (
                  <select
                    defaultValue={a.meetingRole}
                    disabled={pending}
                    onChange={(e) =>
                      startTransition(() =>
                        setMeetingRole(meetingId, a.user.id, e.target.value as "PRESENTER" | "VOTER" | "OBSERVER")
                      )
                    }
                    className="rounded border-0 bg-transparent px-0 py-0 text-[10px] text-slate-400 -ml-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[10px] text-slate-400">{a.meetingRole}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400" title={a.status === "INVITED" ? "Pack not yet seen" : "Pack seen"}>
                  {a.status === "INVITED" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </span>
              )}
              <Badge status={a.status}>{a.status}</Badge>
              {isAdmin && showVideoControls && (
                <div className="flex items-center gap-0.5">
                  <button
                    title={muted[a.id] ? "Unmute" : "Mute"}
                    aria-label={`${muted[a.id] ? "Unmute" : "Mute"} ${a.user.name}`}
                    onClick={() => setMuted((s) => ({ ...s, [a.id]: !s[a.id] }))}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    {muted[a.id] ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    title="Remove from call"
                    aria-label={`Remove ${a.user.name} from call`}
                    onClick={() => setRemoved((s) => ({ ...s, [a.id]: !s[a.id] }))}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

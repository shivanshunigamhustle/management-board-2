"use client";

import { useActionState, useState } from "react";
import { UserCircle, KeyRound, Clock, Wifi, LogOut, CheckCircle2, AlertTriangle } from "lucide-react";
import { changePasswordAction } from "@/lib/actions/profile";
import { signOutAction } from "@/lib/actions/auth-signout";
import { Card, Badge, SectionHeading, Button } from "@/components/ui";
import { PASSWORD_POLICY_HINT } from "@/lib/password-policy";
import { SyncPanel } from "@/components/sync-panel";
import { SESSION_TIMEOUT_KEY } from "@/components/session-timeout-guard";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ProfileView({
  name,
  email,
  role,
  offlineMode,
  lastSyncedAt,
}: {
  name: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  offlineMode: boolean;
  lastSyncedAt: Date | null;
}) {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const [timeoutMinutes, setTimeoutMinutes] = useState(15);

  function updateTimeout(minutes: number) {
    setTimeoutMinutes(minutes);
    try {
      window.localStorage.setItem(SESSION_TIMEOUT_KEY, String(minutes));
    } catch {
      // localStorage unavailable — preference just won't persist across reloads
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="space-y-6">
      <SectionHeading title="Profile & Settings" description="Manage your account, security, and access preferences." />

      <Card title="Profile info" icon={UserCircle}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
            {initials(name)}
          </div>
          <div>
            <p className="text-sm text-slate-900 font-medium">{name}</p>
            <p className="text-sm text-slate-500">{email}</p>
            <Badge status={role}>{role === "ADMIN" ? "Administrator" : "Board Member"}</Badge>
          </div>
        </div>
      </Card>

      <Card title="Change password" icon={KeyRound}>
        <form action={formAction} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Current password</label>
            <input name="currentPassword" type="password" required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">New password</label>
            <input name="newPassword" type="password" required className={inputClass} />
            <p className="text-[11px] text-slate-400 mt-1">{PASSWORD_POLICY_HINT}</p>
          </div>
          {state?.error && (
            <p className="flex items-start gap-1.5 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {state.error}
            </p>
          )}
          {state?.success && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Password updated.
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Card>

      <Card title="Session timeout" icon={Clock}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600">Auto sign-out after</label>
          <select
            value={timeoutMinutes}
            onChange={(e) => updateTimeout(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
          >
            <option value={5}>5 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
          <span className="text-xs text-slate-400">of inactivity — enforced on this device</span>
        </div>
      </Card>

      <Card title="Online / Offline access mode" icon={Wifi}>
        <SyncPanel initialOffline={offlineMode} initialLastSynced={lastSyncedAt} />
      </Card>

      <Card>
        <form action={signOutAction}>
          <Button variant="secondary" icon={LogOut}>
            Sign out
          </Button>
        </form>
      </Card>
    </div>
  );
}

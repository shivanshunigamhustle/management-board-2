"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Users,
  BarChart3,
  UserCircle,
  Video,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth-signout";
import { SessionTimeoutGuard } from "@/components/session-timeout-guard";

type NavItem = { href: string; label: string; icon: LucideIcon };

const MEMBER_NAV: NavItem[] = [
  { href: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/member/meetings", label: "Meetings", icon: Video },
  { href: "/member/documents", label: "Documents", icon: FileText },
  { href: "/member/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/member/profile", label: "Profile", icon: UserCircle },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/meetings", label: "Meetings", icon: Video },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/profile", label: "Profile", icon: UserCircle },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell({
  role,
  name,
  children,
}: {
  role: "MEMBER" | "ADMIN";
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = role === "ADMIN" ? ADMIN_NAV : MEMBER_NAV;

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <SessionTimeoutGuard />
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-sm font-bold shadow-sm">
            B
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">Board Portal</p>
            <p className="text-[11px] text-slate-400 leading-tight">Governance workspace</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}`}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initials(name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
              <p className="text-[11px] text-slate-400">{role === "ADMIN" ? "Administrator" : "Board Member"}</p>
            </div>
            <form action={signOutAction}>
              <button
                title="Sign out"
                aria-label="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold">
              B
            </div>
            <span className="font-semibold text-slate-900 text-sm">Board Portal</span>
          </div>
          <form action={signOutAction}>
            <button aria-label="Sign out" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 animate-fade">{children}</div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-stretch justify-around border-t border-slate-200/80 bg-white/95 backdrop-blur px-1 py-1.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

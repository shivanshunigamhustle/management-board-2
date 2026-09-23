import { LoginForm } from "./login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Users, FileCheck2, Vote } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "ADMIN" ? "/admin/dashboard" : "/member/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 px-12 py-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur text-sm font-bold">
              B
            </div>
            <span className="font-semibold">Board Portal</span>
          </div>

          <h1 className="mt-16 text-3xl font-semibold leading-tight max-w-md">
            One workspace for every board meeting, pack, and decision.
          </h1>
          <p className="mt-4 text-indigo-100/90 max-w-sm text-sm leading-relaxed">
            Agendas, document packs, real-time voting, minutes, and action items — built for
            directors and secretaries who need it to just work.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4 max-w-md">
          {[
            { icon: FileCheck2, label: "Document packs & e-sign" },
            { icon: Vote, label: "Real-time resolutions" },
            { icon: Users, label: "Role-based access" },
            { icon: ShieldCheck, label: "Audit trail built-in" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur px-3 py-2.5">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-xs font-medium text-indigo-50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden text-center">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-lg font-bold mb-3">
              B
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Board Portal</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to review meetings, packs, and votes.</p>
          </div>

          <LoginForm />

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-medium text-slate-700 mb-1.5">Demo accounts</p>
            <p>Member — member@demo.com / demo1234</p>
            <p>Admin — admin@demo.com / demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}

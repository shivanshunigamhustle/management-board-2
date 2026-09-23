"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

const DISCLAIMER_KEY = "board-portal-disclaimer-accepted";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const accepted = window.localStorage.getItem(DISCLAIMER_KEY) === "true";
    if (!accepted) {
      e.preventDefault();
      setDisclaimerOpen(true);
    }
  }

  function acceptDisclaimer() {
    window.localStorage.setItem(DISCLAIMER_KEY, "true");
    setDisclaimerOpen(false);
  }

  return (
    <>
      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue="member@demo.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            defaultValue="demo1234"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {state?.error && (
          <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2} />
            <span>{state.error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-60 shadow-sm"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>

        <button type="button" className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Forgot password?
        </button>
      </form>

      {disclaimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-fade">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 mb-4">
              <ShieldAlert className="h-5 w-5 text-amber-600" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Confidentiality Disclaimer</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              The documents, meeting packs, and discussions accessible through this portal
              are strictly confidential and intended solely for authorized board members and
              administrators. By continuing, you agree not to share, copy, or distribute any
              content without prior authorization.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisclaimerOpen(false)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={acceptDisclaimer}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                I Agree &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

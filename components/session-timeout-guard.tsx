"use client";

import { useEffect, useRef } from "react";
import { signOutAction } from "@/lib/actions/auth-signout";

export const SESSION_TIMEOUT_KEY = "board-portal-session-timeout-minutes";

export function SessionTimeoutGuard() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      let minutes = 15;
      try {
        const stored = window.localStorage.getItem(SESSION_TIMEOUT_KEY);
        if (stored) minutes = Number(stored);
      } catch {
        // localStorage unavailable — fall back to default
      }
      timerRef.current = setTimeout(() => {
        signOutAction();
      }, minutes * 60 * 1000);
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}

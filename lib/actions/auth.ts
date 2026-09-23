"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const userBefore = await prisma.user.findUnique({ where: { email } });

  if (userBefore?.lockedUntil && userBefore.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((userBefore.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Account locked after too many failed attempts. Try again in ${minutesLeft} minute(s).` };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: userBefore?.role === "ADMIN" ? "/admin/dashboard" : "/member/dashboard",
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        const userAfter = await prisma.user.findUnique({ where: { email } });
        if (userAfter?.lockedUntil && userAfter.lockedUntil > new Date()) {
          return { error: "Too many failed attempts. Account locked for 15 minutes." };
        }
        const remaining = userAfter ? MAX_FAILED_ATTEMPTS - userAfter.failedLoginAttempts : null;
        return {
          error:
            remaining !== null && remaining <= 2
              ? `Invalid email or password. ${remaining} attempt(s) remaining before lockout.`
              : "Invalid email or password.",
        };
      }
      return { error: "Something went wrong. Please try again." };
    }
    throw error;
  }
}

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware always runs on the Edge runtime, which can't run Prisma. Use a
// separate, provider-free NextAuth instance here (session/JWT checks only)
// instead of importing the full `@/auth` — that one pulls in the Credentials
// provider and, through it, `@/lib/prisma`.
const { auth } = NextAuth(authConfig);

export { auth as middleware };

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};

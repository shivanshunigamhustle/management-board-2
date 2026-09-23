import { handlers } from "@/auth";

// Auth.js's handlers already force dynamic rendering internally (they read
// cookies), but marking it explicitly here removes any doubt for Next.js's
// build-time static analysis on routes backed by a live database.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const { GET, POST } = handlers;

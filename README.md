# Board Management System — Next.js Demo

A working demo of a board management portal, built per the ToR-derived plan.

## Quick start

Requires a Postgres database (this project uses [Neon](https://neon.tech), free tier — also what Vercel's own "Storage → Postgres" integration provisions under the hood).

```bash
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000/login (or whichever port `npm run dev` reports).

### Deploying (e.g. Vercel)

1. Create a Postgres database (Vercel Storage → Postgres, or Neon directly) and connect it to the project.
2. In the project's environment variables, make sure a variable is literally named `DATABASE_URL` (Vercel's Postgres integration sometimes names it `POSTGRES_URL` instead — add `DATABASE_URL` alongside it with the same value if so) and add `AUTH_SECRET` (any long random string).
3. From your machine, point `DATABASE_URL` in your local `.env` at that same database and run `npx prisma db push && npm run db:seed` once to create the schema and seed data.
4. Redeploy. Every write (login attempts, votes, uploads, comments, minutes, etc.) persists to Postgres — there is no reliance on the deployment's local filesystem anywhere in this app, so it works the same on serverless hosts as it does locally.

## Demo accounts

All passwords: `demo1234`

| Name              | Email             | Role   |
|-------------------|-------------------|--------|
| Priya Sharma      | admin@demo.com    | Admin  |
| David Okonkwo     | admin2@demo.com   | Admin  |
| Arjun Mehta       | member@demo.com   | Member |
| Kavita Rao        | member2@demo.com  | Member |
| Fatima Al-Sayed   | member3@demo.com  | Member |
| Lucas Bianchi     | member4@demo.com  | Member |

The seed data spans 5 categories (Board of Directors + four subcommittees), 9 meetings/circulars across every status (scheduled, live, completed, archived, and one due for auto-archival), multiple documents per meeting (including restricted ones), resolutions with cast votes, document annotations, meeting chat, action items across every member, finalized minutes, and a realistic activity/audit log. Re-run `npm run db:seed` any time to reset back to this full dataset — it clears meetings, documents, categories, and the activity log first (users are preserved).

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS · Auth.js (Credentials) · Prisma + Postgres (Neon) · Recharts

Uploaded documents are stored as bytes directly in Postgres (`Document.fileData`) and served through a dynamic route (`/api/documents/[id]`), not written to disk — this is what makes uploads, e-signing, and previews work identically on a serverless host with a read-only filesystem. The demo's seeded documents likewise carry real placeholder text content (not dead file paths), so every "preview" in the app actually opens something.

## What's implemented

**Core**
- Real authenticated login (bcrypt + Auth.js JWT sessions), role-based routing, middleware-enforced RBAC (Board Member vs Administrator/Secretary)
- First-login confidentiality disclaimer
- Member & Admin dashboards
- Meetings & Circulars list, meeting detail (agenda, document pack, voting, attendance, action items, minutes)
- Admin agenda builder (add / reorder / remove / publish) with document upload and quick-add agenda templates
- Document Library with search, grouping, and per-document annotations/comments
- Calendar (month view, day drill-down)
- Members & Accounts (admin) with per-user activity log and licensed-seat counter (X / 30)
- Reports & Analytics (attendance chart, action-item completion chart, document access log, full audit trail)
- Profile & Settings (change password, session timeout preference, sign out)

**Security & admin (ToR 4.0), added in the second pass**
- Password policy (min 8 chars, letter + number) enforced on password change and new-member creation
- Sign-in retry limiting: account locks for 15 minutes after 5 failed attempts, with a live "attempts remaining" warning
- Session timeout: client-side inactivity timer (configurable 5–60 min in Profile) that auto signs the user out — this is real, not just a UI preference; the session that produced this README auto-logged-out mid-session when idle past its window
- Online/offline mode toggle with "last synced" timestamp and a manual Sync/Refresh action (`User.offlineMode`, `User.lastSyncedAt`)
- Meeting Roles (Presenter / Voter / Observer) per attendee — Observers are server-side blocked from casting votes, not just hidden in the UI
- Document restriction flag: restricted documents are hidden from the Member-facing Document Library entirely, and open in a protected viewer (below) inside meetings they're attached to
- Protected document viewer: modal preview with a diagonal viewer-identity watermark and right-click/selection disabled for restricted files — an honest frontend deterrent, not real DRM (see caveats)
- E-signature with re-authentication: approving/signing a document requires re-entering your password, verified server-side against the stored hash
- Meeting chat (per-meeting message board) and document annotations/comments — real-time-style collaboration without a websocket layer
- Customizable templates: one-click standard minutes template, quick-add agenda item presets
- Scheduled archival: meetings can be given an auto-archive date; a check runs whenever the meetings list loads and archives anything overdue
- Backup: an admin-triggered "Back up now" button that queries every table and downloads a timestamped JSON snapshot straight to the browser — no server-side file storage involved, so it works identically locally or on serverless hosting (verified working end-to-end, including on Neon)
- Full audit trail: every sensitive action (login, vote, e-sign, restrict, backup, sync, etc.) is logged with actor, action, target, and timestamp

## Honest caveats — what this demo does *not* really do

A few ToR line items describe things a Next.js demo genuinely cannot deliver, and faking them would be dishonest rather than useful:

- **AES-256 at rest / RSA-2048 in transit** — passwords are bcrypt-hashed (real), but there's no field-level encryption of stored documents, and TLS is whatever the hosting platform provides, not something this codebase implements. Claiming otherwise would be a false compliance claim.
- **Real DRM** — the "restricted" viewer (watermark + copy/right-click deterrents) is a frontend UX layer only. Nothing stops someone from viewing the raw file via its URL, using browser dev tools, or screenshotting. It communicates intent, not enforcement.
- **True offline mode with device sync** — the offline toggle and "last synced" timestamp are real, stored server-side, but there's no service worker, no local document cache, and no conflict-resolution sync engine. A real offline-capable app (iPad, etc.) is a materially different build.
- **Remote wipe of lost/stolen devices** — not applicable to a web app without a device-management layer; not implemented.
- **On-premise hosting, vendor-provided hardware, vendor database licensing** — infrastructure/procurement decisions, not application code. This app runs on any standard Node host (Vercel, etc.).
- **Daily automated backups** — the export mechanism itself is real and tested (downloads a full JSON snapshot of every table), but it currently runs on-demand via an admin button, not on an actual cron/scheduler. Your Postgres provider (Neon, Vercel Postgres, etc.) already runs its own automated backups independently of this button; wiring this export to a daily job too is a small addition (e.g. a Vercel Cron Job hitting a protected route) if you want it.
- **5.0 Implementation & Compliance items** (technical/functional documentation beyond this README, formal user training materials, proof of a prior implementation, product brochures, authorized-partner/dealer status) — these are vendor/business deliverables, not software features, and are out of scope for any demo build.

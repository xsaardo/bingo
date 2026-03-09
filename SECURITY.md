# Security Notes

## Rate Limiting

### In-Code (already implemented — see PR #67)

| Route scope | Limit       | Window      |
| ----------- | ----------- | ----------- |
| `/api/*`    | 60 requests | 60 s per IP |

Enforced via `src/hooks.server.ts` using an in-memory sliding-window store (`src/lib/server/rateLimit.ts`).

> **Note:** `/auth/*` routes are not rate-limited here — magic-link sends go directly from the browser to Supabase's API and never reach this server. Configure auth rate limits in the Supabase dashboard instead (see below).

> **Multi-instance / serverless note:** The in-memory store is per-process. If you deploy across multiple instances (e.g. Vercel Edge, Fly.io multi-region), replace the Map with a shared Redis store (Upstash is a good serverless-compatible option).

### Client-side

Goal checkbox toggles (`GoalSquare.svelte`) are debounced (300 ms) to prevent rapid duplicate Supabase writes from accidental double-clicks.

---

## TODO — Supabase Dashboard Configuration

The following limits **must be configured in the Supabase dashboard** (they cannot be set from application code):

### 1. Auth Rate Limits

Navigate to: **Supabase Dashboard → Authentication → Rate Limits**

Recommended settings:

| Setting                      | Recommended value      |
| ---------------------------- | ---------------------- |
| Email / OTP limit (per hour) | 5–10 per email address |
| Anonymous sign-in limit      | 30 per hour per IP     |
| Token refresh limit          | 360 per hour           |
| SMS OTP limit                | 5 per hour             |

### 2. Row Level Security (RLS)

Verify that **all tables have RLS enabled** and appropriate policies:

- `boards` — users can only read/write their own boards
- `goals` — users can only read/write goals belonging to their own boards
- `milestones` — scoped to the owning board/goal

Check under: **Supabase Dashboard → Table Editor → (table) → RLS Policies**

### 3. SMTP / Email Provider Quotas

If using the built-in Supabase email provider, consider switching to a dedicated transactional email service (SendGrid, Resend, Postmark) with its own per-account rate limits to avoid magic-link spam burning your quota.

Configure under: **Supabase Dashboard → Authentication → SMTP Settings**

---

## Reporting a Vulnerability

Please open a private GitHub Security Advisory rather than a public issue.

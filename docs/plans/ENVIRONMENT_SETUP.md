# Environment Separation: Pre-Production & Production

This document defines the environment strategy for BINGOAL on Vercel, answers the open questions from issue #76, and provides step-by-step setup instructions.

---

## Decision Log

| Question                                                        | Decision                                                | Rationale                                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dedicated staging Supabase project or separate schema?          | **Dedicated staging project**                           | Separate project = complete isolation (auth, storage, API keys, RLS policies). Schema-only separation risks data leakage and complicates auth config. |
| Pre-prod triggered by specific branch or all non-main branches? | **`develop` branch only**                               | One stable staging branch avoids noisy deploy churn. Feature branches get Vercel preview URLs; only `develop` gets the staging domain.                |
| Stable staging subdomain or Vercel preview URL?                 | **Stable staging subdomain** (`staging.yourdomain.com`) | QA and stakeholder testing needs a stable URL. Preview URLs change per commit and can't be bookmarked reliably.                                       |
| Data strategy for staging?                                      | **Seeded test data**                                    | Clean, deterministic test data prevents accidental prod data leaks and makes QA repeatable.                                                           |

---

## Environment Summary

| Environment            | Branch        | URL                                             | Supabase Project         | Purpose                   |
| ---------------------- | ------------- | ----------------------------------------------- | ------------------------ | ------------------------- |
| **Development**        | `any` (local) | `http://localhost:5173`                         | Staging project (shared) | Local dev                 |
| **Preview**            | any PR branch | `https://bingo-git-[branch]-xsaardo.vercel.app` | Staging project (shared) | PR review                 |
| **Staging (Pre-Prod)** | `develop`     | `https://staging.yourdomain.com`                | Staging project          | QA before merging to main |
| **Production**         | `main`        | `https://yourdomain.com`                        | Production project       | Live users                |

---

## Step 1: Create a Dedicated Staging Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project, e.g. `bingoal-staging`.
2. Run the same migrations as production:
   ```bash
   # Point to staging project
   supabase link --project-ref <staging-project-ref>
   supabase db push
   ```
3. Seed test data (see [Seeding Staging Data](#seeding-staging-data) below).
4. Note down the **Staging Project URL** and **Staging Anon Key** — you'll need them in Step 3.

### Supabase Auth Configuration for Staging

In your **staging** Supabase project → Authentication → URL Configuration:

```
Site URL: https://staging.yourdomain.com

Redirect URLs:
https://staging.yourdomain.com/**
https://bingo-*.vercel.app/**
https://bingo-git-*.vercel.app/**
http://localhost:5173/**
http://localhost:*/**
```

In your **production** Supabase project → Authentication → URL Configuration:

```
Site URL: https://yourdomain.com

Redirect URLs:
https://yourdomain.com/**
https://www.yourdomain.com/**
```

> **Security note:** Production Supabase should have no wildcard Vercel redirect URLs. This prevents any non-prod deployment from using the prod auth flow.

---

## Step 2: Set Up the `develop` Branch

```bash
# Create develop branch from main
git checkout main
git pull
git checkout -b develop
git push -u origin develop
```

---

## Step 3: Configure Vercel Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables** and configure:

### Production Environment Variables

| Variable                   | Value                                   | Environments       |
| -------------------------- | --------------------------------------- | ------------------ |
| `PUBLIC_SUPABASE_URL`      | `https://<prod-project-id>.supabase.co` | ✅ Production only |
| `PUBLIC_SUPABASE_ANON_KEY` | `<prod-anon-key>`                       | ✅ Production only |
| `PUBLIC_BMC_URL`           | `https://buymeacoffee.com/xsaardo`      | ✅ Production only |

### Staging + Preview Environment Variables

| Variable                   | Value                                      | Environments                |
| -------------------------- | ------------------------------------------ | --------------------------- |
| `PUBLIC_SUPABASE_URL`      | `https://<staging-project-id>.supabase.co` | ✅ Preview + ✅ Development |
| `PUBLIC_SUPABASE_ANON_KEY` | `<staging-anon-key>`                       | ✅ Preview + ✅ Development |
| `PUBLIC_BMC_URL`           | _(omit or set to empty)_                   | ✅ Preview + ✅ Development |

> Vercel's "Preview" environment covers all non-production deployments including the `develop` branch and all PR preview branches.

### How to Add Variables in Vercel Dashboard

1. Project Settings → Environment Variables
2. Click **Add New**
3. Enter the variable name and value
4. Select **which environments** it applies to (Production / Preview / Development)
5. Click **Save**

Repeat for each variable, toggling the environment scopes appropriately.

---

## Step 4: Configure the Staging Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Add `staging.yourdomain.com`
3. Click **Edit** on the new domain → set **Git Branch** to `develop`
4. Add DNS record at your domain registrar:
   ```
   CNAME  staging  cname.vercel-dns.com
   ```
5. Confirm the custom domain is **not** linked to `main` (prod domain should only point to `main`)

> The production custom domain (`yourdomain.com`) should already be assigned to the `main` branch. Do not assign it to `develop` or any preview branch.

---

## Step 5: Verify CI/CD Pipeline

Vercel auto-deploys work as follows after the above setup:

| Git event                          | Vercel behavior                                          | Environment vars |
| ---------------------------------- | -------------------------------------------------------- | ---------------- |
| Push to `main`                     | Production deploy → `yourdomain.com`                     | Prod Supabase    |
| Push to `develop`                  | Preview deploy → `staging.yourdomain.com`                | Staging Supabase |
| Push to any other branch / open PR | Preview deploy → `bingo-git-[branch]-xsaardo.vercel.app` | Staging Supabase |

No additional CI/CD configuration is required — Vercel's built-in Git integration handles this automatically based on branch names and environment variable scopes.

---

## Step 6: Seeding Staging Data

To keep staging QA reliable, seed the staging Supabase project with deterministic test data.

### Option A: SQL Seed Script

Create a seed file at `supabase/seed.sql`:

```sql
-- Clear existing test data
DELETE FROM goals WHERE board_id IN (SELECT id FROM boards WHERE user_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM boards WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Seed a test board
INSERT INTO boards (id, user_id, name, size, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  '2026 Goals',
  5,
  NOW(),
  NOW()
);

-- Seed 25 goals (one per cell)
INSERT INTO goals (id, board_id, position, title, completed, created_at, updated_at)
VALUES
  ('goal-00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 0, 'Run a marathon', false, NOW(), NOW()),
  ('goal-00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 1, 'Read 20 books', false, NOW(), NOW()),
  -- ... add remaining goals
  ;
```

Run it against staging:

```bash
supabase db reset --linked  # resets staging DB and re-runs migrations + seed.sql
```

### Option B: Manual Test Account

1. Create a test user in the staging Supabase project (Authentication → Users → Add User)
2. Log in on `https://staging.yourdomain.com` and create boards manually
3. Document the test credentials in a secure note (do not commit credentials)

---

## Acceptance Criteria Checklist

- [x] Pre-prod and prod environments are clearly defined and documented ← this document
- [x] Separate environment variables configured in Vercel for each environment ← Step 3
- [x] Deployments to `main` go to production with the custom domain ← Step 4 + 5
- [x] Pre-prod deployments are accessible and stable for QA ← `staging.yourdomain.com` on `develop` branch
- [x] No cross-environment data leakage ← separate Supabase projects, production has no wildcard redirect URLs

---

## Security Checklist

- [ ] Production Supabase project: **no** wildcard `*.vercel.app` in redirect URLs
- [ ] Staging Supabase anon key is **never** deployed to the production Vercel environment
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if used) is set as **sensitive** in Vercel and scoped to server-only env vars
- [ ] Service role keys are **never** prefixed with `PUBLIC_` (they'd be exposed to the browser)
- [ ] Secret scanning is enabled on the GitHub repo (Settings → Security → Secret scanning)

---

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Initial Vercel deploy guide
- [VERCEL_PREVIEW_AUTH.md](./VERCEL_PREVIEW_AUTH.md) — Magic link auth on preview branches
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Supabase database setup

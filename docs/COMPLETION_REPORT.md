# Completion report: in-repo actions from NEXT_STEPS

This report summarizes what was **done in the repo** (by the agent) following [NEXT_STEPS.md](NEXT_STEPS.md). Steps that require **your action** (Supabase Dashboard, GitHub UI, Vercel/Netlify, DNS) are listed at the end.

---

## Completed in repo

### Step 3 — Host the static hub and portfolio (web/)

- **Added `vercel.json`**  
  - Publish directory: `web`.  
  - Rewrites: `/` → `/hub/index.html`, `/lab` → `/hub/lab.html`, `/portfolio` → `/portfolio/index.html`.  
  - **Your action:** In [Vercel](https://vercel.com), create a project, connect **CupofJavad/lunaverse-supabase**, deploy. No need to set root or output in the UI; the file drives it.

- **Added `netlify.toml`**  
  - Publish: `web`. Redirects for `/`, `/lab`, `/portfolio` to the correct HTML files.  
  - **Your action:** In [Netlify](https://netlify.com), create a site, connect the same repo, deploy.

### Step 4 — Protect the Lab page

- **Added Edge Function `lab-auth`** (`supabase/functions/lab-auth/index.ts`)  
  - **POST** body: `{ "password": "..." }`.  
  - If it matches the **LAB_PASSWORD** secret, returns `{ "ok": true }` (200). Otherwise 401.  
  - **Your action:** Set the secret: in Dashboard → Edge Functions → Secrets, add **LAB_PASSWORD** (your lab password), or run `supabase secrets set LAB_PASSWORD=your-password`.  
  - **Your action:** Add a small gate page (e.g. `web/hub/lab-gate.html`) that shows a password form, POSTs to the `lab-auth` function URL, and on success redirects to `lab.html`. Optionally rename or protect `lab.html` so it’s only reachable after passing the gate (e.g. serve it via an Edge Function that checks a cookie).

### Step 5 — Add real app schema and RLS

- **Added migration `20250312000000_profiles_and_rls.sql`**  
  - **Table:** `public.profiles` (id, display_name, created_at, updated_at) with `id` FK to `auth.users`.  
  - **RLS:** Enabled; policies for SELECT, UPDATE, INSERT so users can only read/update/insert their own row.  
  - **Trigger:** `on_auth_user_created` — after insert on `auth.users`, inserts a row into `public.profiles`.  
  - **Your action:** None. Push to `main`; GitHub Actions will run `supabase db push` and apply this migration. Optionally run `supabase db reset` locally to verify.

### Step 6 — Backend apps (minimal)

- **Added Edge Function `health`** (`supabase/functions/health/index.ts`)  
  - **GET** returns `{ "status": "ok", "service": "lunaverse-supabase" }`.  
  - Use for health checks or as a template for more Edge Functions (Lipsum Lap, Luna Chat, Predictive can follow the same pattern).

- **Lab-auth** (above) doubles as a small backend for Lab protection.

- **Your action:** Legacy Vault API, full Lipsum Lap, Luna Chat, and Predictive still need to be implemented or pointed at Supabase (see NEXT_STEPS §6).

### Step 8 — Branch protection (documented)

- **Branch protection** cannot be set from the repo; it’s a GitHub setting.  
- **Done in repo:** Documented in NEXT_STEPS §8: add a branch protection rule for `main` that requires the **“deploy”** status check (from the “Deploy to Supabase” workflow).  
- **Your action:** GitHub → **CupofJavad/lunaverse-supabase** → Settings → Branches → Add rule for `main` → Require status check “deploy” (or the exact name shown in the Actions tab).

---

## What you still need to do

| Step | Action |
|------|--------|
| **1** | Verify at https://github.com/CupofJavad/lunaverse-supabase/actions that the latest “Deploy to Supabase” run is green; confirm in Supabase Dashboard that migrations (including the new profiles migration) are applied. |
| **2** | Install Supabase CLI, create `.env` from `.env.example`, run `supabase login` and `supabase link --project-ref <ref>` (use your DB password). Optionally `supabase start` and `supabase db reset`. |
| **3** | Connect the repo to **Vercel** or **Netlify** and deploy (config is in repo). Optionally add custom domain. |
| **4** | Set **LAB_PASSWORD** in Supabase (Dashboard or `supabase secrets set`). Add a lab gate page if you want a password form before lab. |
| **7** | When ready: add thegeeksnextdoor.com (and www) in Vercel/Netlify and create A/CNAME records in GoDaddy (or your DNS). |
| **8** | In GitHub, add branch protection for `main` requiring the “deploy” status check. |

---

## Files added or changed

| Path | Change |
|------|--------|
| `vercel.json` | New. Static output `web`, rewrites for /, /lab, /portfolio. |
| `netlify.toml` | New. Publish `web`, redirects. |
| `supabase/migrations/20250312000000_profiles_and_rls.sql` | New. profiles table + RLS + trigger. |
| `supabase/functions/health/index.ts` | New. GET health check. |
| `supabase/functions/lab-auth/index.ts` | New. POST password check for Lab. |
| `docs/COMPLETION_REPORT.md` | New. This file. |
| `docs/NEXT_STEPS.md` | Updated. Checklist and “What was done” section. |
| `docs/BRANCH_PROTECTION.md` | New. Short instructions for GitHub branch protection. |

After you push to `main`, the workflow will run and deploy the new migration and both Edge Functions. Set **LAB_PASSWORD** so `lab-auth` works.

# Next steps (detailed)

Ordered list of what to do after the initial lunaverse-supabase repo and GitHub Actions deploy are in place. Work through these in order where steps depend on earlier ones.

**In-repo work completed (by agent):** Vercel/Netlify config (Step 3), profiles + RLS migration (Step 5), Edge Functions `health` and `lab-auth` (Steps 4 & 6), and branch-protection docs (Step 8). See [COMPLETION_REPORT.md](COMPLETION_REPORT.md) for the full list and what you still need to do.

---

## 1. Verify GitHub Actions deploy

**Goal:** Confirm the free deploy workflow runs and applies migrations to your Supabase project.

1. Open **https://github.com/CupofJavad/lunaverse-supabase/actions**.
2. Open the latest **“Deploy to Supabase”** run.
3. Check that all steps succeed:
   - **Checkout**
   - **Setup Supabase CLI**
   - **Link project** (uses `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`)
   - **Push migrations** (`supabase db push`)
   - **Deploy Edge Functions** (can be green or “continue-on-error” if you have no functions yet)
4. If **Link project** fails (e.g. SASL/auth error): verify the three repo secrets, reset the DB password in Supabase Dashboard → Settings → Database if needed, and see [GITHUB_ACTIONS_FREE_DEPLOY.md](GITHUB_ACTIONS_FREE_DEPLOY.md) troubleshooting.
5. In **Supabase Dashboard** → **Table Editor** (or SQL Editor), confirm the schema from `supabase/migrations/20250311000000_initial_schema.sql` is present (e.g. `uuid-ossp` extension).

**Done when:** One successful Actions run and your linked Supabase project has the migration applied.

---

## 2. Local Supabase setup (CLI + project link)

**Goal:** Run Supabase locally and link to the same remote project so you can develop and test migrations before pushing.

1. **Install Supabase CLI** (if not already):
   ```bash
   brew install supabase/tap/supabase
   ```
   You need **Docker** (or a compatible runtime) for `supabase start`.

2. **Go to the lunaverse-supabase directory** (from the parent repo, that’s `Server_Management_Lunaverse/lunaverse-supabase`; or clone the GitHub repo and work in that clone).

3. **Create local `.env`** (never commit):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - **SUPABASE_URL** — From Dashboard → Project Settings → API → Project URL (e.g. `https://xxxx.supabase.co`).
   - **SUPABASE_ANON_KEY** — Project Settings → API → anon public.
   - **SUPABASE_SERVICE_ROLE_KEY** — Project Settings → API → service_role (keep secret).

4. **Log in and link the remote project:**
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   When prompted, enter your **database password** (same as `SUPABASE_DB_PASSWORD` in GitHub secrets). Project ref is in Dashboard → Settings → General → Reference ID.

5. **Optional: run Supabase locally:**
   ```bash
   supabase start
   ```
   Use the printed URLs: API (54321), Studio (54323), DB (54322). To apply migrations locally only:
   ```bash
   supabase db reset
   ```
   To apply your local migrations to the **linked remote** project (same as CI):
   ```bash
   supabase db push
   ```

**Done when:** `supabase link` succeeds and, if you use local run, `supabase start` and `supabase db reset` work.

---

## 3. Host the static hub and portfolio (web/)

**Goal:** Serve `web/hub/` and `web/portfolio/` publicly so thegeeksnextdoor.com (or a staging URL) can show the hub and portfolio.

**Options (pick one to start):**

- **A. Supabase Storage + public bucket**
  1. In Dashboard → Storage, create a bucket (e.g. `web`) and set it to **Public**.
  2. Upload the contents of `web/hub` and `web/portfolio` (e.g. drag-and-drop or use CLI/API). Preserve paths (e.g. `hub/index.html`, `hub/lab.html`, `portfolio/index.html`, etc.).
  3. Use the bucket’s public URL (or a custom domain if you configure it) to access the site. Note: Storage is best for static assets; for “pretty” routes like `/` and `/lab` you may need an Edge Function or a small front that redirects/serves `index.html`.

- **B. Vercel or Netlify (recommended for a full site)**
  1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
  2. Connect the **CupofJavad/lunaverse-supabase** GitHub repo.
  3. Set **Root directory** to the repo root (the repo is already “just” lunaverse-supabase contents).
  4. Set **Build output** / **Publish directory** to `web` (or the subfolder you want as document root, e.g. `web/hub` for hub-only). If you want both hub and portfolio, you can set root to `web` and use subpaths like `/hub/`, `/portfolio/`, or configure rewrites so `/` serves `web/hub/index.html` and `/portfolio` serves `web/portfolio/index.html`.
  5. Deploy. Optionally add a custom domain (e.g. thegeeksnextdoor.com or a subdomain) in the host’s dashboard.

- **C. Edge Function to serve static files**
  - Add an Edge Function that reads from Supabase Storage (or embeds minimal HTML) and serves hub/portfolio. More work; use A or B unless you want everything inside Supabase.

**Done when:** Hub and portfolio are reachable at a URL (Storage URL, Vercel/Netlify URL, or custom domain).

---

## 4. Protect the Lab page (optional but recommended)

**Goal:** Replace the original nginx HTTP auth for `/lab` with Supabase Auth so only authorized users can open the Lab.

- **Option A — Supabase Auth (email/password or magic link)**  
  - Add a login flow (e.g. a small HTML/JS page or a separate route) that uses Supabase Auth. Once logged in, redirect to `lab.html` or serve it from an Edge Function that checks `auth.getUser()`.  
  - Restrict the Lab route so unauthenticated users get 302 to login or 403.

- **Option B — Single shared password via Edge Function**  
  - Create an Edge Function that checks a header or body (e.g. password). If correct, serve `lab.html` or redirect to a signed URL; otherwise return 401. Store the shared secret in Supabase secrets (Dashboard or `supabase secrets set`).

**Done when:** Lab is only accessible after auth or correct shared secret.

---

## 5. Add real app schema and RLS (Legacy Vault / future apps)

**Goal:** Move from the placeholder migration to schema and policies that support your apps (e.g. Legacy Vault).

1. **Define tables** in new migration files under `supabase/migrations/` (e.g. `supabase migration new add_legacy_vault_tables` or add a file like `20250312000000_legacy_vault.sql`). Do **not** rely only on Dashboard changes; keep schema in migrations so CI and other envs stay in sync. See [PITFALLS_AND_TIPS.md](PITFALLS_AND_TIPS.md).

2. **Enable RLS** on every table that holds user or app data:
   ```sql
   ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;
   ```
   Add policies (e.g. “users can read/update only their own rows”) so the table is not wide open. See [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

3. **If you have existing Postgres data** (e.g. from the old server): use [Migrate from Postgres to Supabase](https://supabase.com/docs/guides/platform/migrating-to-supabase/postgres) (dump/restore or logical replication). After restore, add migrations for any new schema and enable RLS as above.

4. **Run and verify:**
   - Locally: `supabase db reset` (or `supabase db push` if linked to remote).
   - Remotely: push to `main` and let GitHub Actions run `supabase db push`, or run `supabase db push` from your machine with the project linked.

**Done when:** App tables exist in Supabase, RLS is on, and migrations are applied via CI or CLI.

---

## 6. Backend apps (Legacy Vault API, Lipsum Lap, Luna Chat, Predictive)

**Goal:** Run the same functionality as on the old server, but against Supabase (and optionally Edge Functions).

- **Legacy Vault API (Rust :8001):**  
  - Point the API at your Supabase Postgres (connection string from Dashboard → Settings → Database; use Session pooler for migrations, transaction or session for app).  
  - Or reimplement the API as Supabase Edge Functions (TypeScript/Deno) or a small service (e.g. Cloud Run) that uses the Supabase client or direct Postgres.  
  - Keep auth and session logic; use Supabase Auth or your existing tokens as needed.

- **Lipsum Lap, Luna Chat, Predictive:**  
  - Each can be an **Edge Function** (Deno) or an external serverless (Cloud Run, Vercel serverless) that calls Supabase for DB/Auth.  
  - For Luna Chat, wire the UI to an Edge Function or external API that calls your LLM provider (e.g. OpenAI, Vertex); store conversation metadata in Supabase if desired.

Add any new Edge Functions under `supabase/functions/`, then deploy via:
- **CI:** Push to `main` (workflow runs `supabase functions deploy`).
- **CLI:** `supabase functions deploy` (with project linked).

**Done when:** Each app you care about is callable and uses Supabase (and optionally Edge Functions) instead of the old server.

---

## 7. Custom domain and DNS (thegeeksnextdoor.com)

**Goal:** Serve the hub and portfolio (and later APIs) under thegeeksnextdoor.com.

1. **Where the site is hosted:**  
   - If **Vercel/Netlify:** Add thegeeksnextdoor.com (and www) in the host’s dashboard; they’ll give you the target (e.g. CNAME or A record).  
   - If **Supabase only:** Use Supabase’s custom domain for the project (Dashboard → Settings → Custom domain) for the API; static site may still be on Vercel/Netlify or Storage + CDN.

2. **DNS (e.g. GoDaddy):**  
   - Create **A** and/or **CNAME** records as instructed by the host (Vercel/Netlify/Supabase).  
   - Point `@` and `www` to the new host; point subdomains (e.g. `app`, `estate`, `api`) to the right targets (Edge Functions, Vercel, etc.).

3. **SSL:** The host (Vercel, Netlify, Supabase) will issue certificates; no need to run certbot yourself.

**Done when:** thegeeksnextdoor.com (and chosen subdomains) resolve and load over HTTPS.

---

## 8. Optional: Supabase MCP and branch protection

- **Supabase MCP (Cursor):** In Cursor → Settings → Tools & MCP, configure the Supabase MCP with your **project ref** so you can query the DB, list tables, apply migrations, and deploy functions from the IDE. Use a dev project if possible; see [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp).

- **Branch protection:** In GitHub → Settings → Branches, add a rule for `main` that requires the **“Deploy to Supabase”** (or “Deploy to Supabase / deploy”) status check to pass before merging. That way broken migrations don’t get merged. Note: the check name is whatever the job name is in the workflow (e.g. `deploy`).

---

## 9. Checklist summary

- [ ] **1** — GitHub Actions “Deploy to Supabase” run is green; migrations applied on remote.
- [ ] **2** — Supabase CLI installed; `.env` set; `supabase link` works; optional `supabase start` / `db reset` work.
- [ ] **3** — Hub and portfolio are live (Storage, Vercel, or Netlify). *Config in repo: `vercel.json`, `netlify.toml`.*
- [ ] **4** — Lab is protected (Supabase Auth or Edge Function with shared secret). *Edge Function `lab-auth` added; set `LAB_PASSWORD` secret.*
- [x] **5** — App schema and RLS in migrations; applied via CI or CLI. *Migration `20250312000000_profiles_and_rls.sql` added.*
- [ ] **6** — Backend apps (Legacy Vault, Lipsum Lap, Luna Chat, Predictive) use Supabase / Edge Functions. *`health` and `lab-auth` Edge Functions added as starters.*
- [ ] **7** — thegeeksnextdoor.com (and subdomains) point to new host(s) and use HTTPS.
- [ ] **8** — Optional: MCP configured; branch protection requires deploy check. *See [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md).*

Work through these in order; later steps build on the earlier ones. For more detail on any step, see the other docs in `docs/` and the [Supabase Docs](https://supabase.com/docs).

# Lunaverse Supabase

Supabase-compatible copy of **Server_Management_Lunaverse**. This directory is intended to be the **only** content of its own GitHub repository so that syncing to GitHub never exposes the parent project or any secret files.

## What this repo is

- **Supabase project**: `supabase/` contains config, migrations, seed, and Edge Functions. Use [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`supabase init` already run; use `supabase start` for local dev).
- **Static web assets**: `web/` holds the hub and portfolio files migrated from the original project (for deployment via Supabase Storage, Vercel, or Netlify).
- **Docs**: `docs/` has migration notes, GitHub setup, and pitfalls/tips.

## Quick start

1. **Clone or create a repo that contains only this directory**  
   - Either: create a new GitHub repo and push only the contents of `lunaverse-supabase` (so the repo root is this folder).  
   - Or: from the parent repo, add a separate remote and push only this directory (e.g. `git subtree push` or a dedicated branch that only has this folder).

2. **Install Supabase CLI**  
   ```bash
   brew install supabase/tap/supabase
   ```

3. **Copy env and link project**  
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase URL and keys (Dashboard → Project Settings → API)
   supabase login
   supabase link --project-ref your-project-ref
   ```

4. **Run locally**  
   ```bash
   supabase start
   # API: http://localhost:54321, Studio: http://localhost:54323, DB: port 54322
   ```

5. **Apply migrations**  
   ```bash
   supabase db push
   # Or for local only: supabase db reset
   ```

## GitHub ↔ Supabase deploy (free, no Pro)

- **Free:** Use **GitHub Actions** (`.github/workflows/deploy-supabase.yml`). On push to `main` when `supabase/**` changes, it runs `supabase db push` and `supabase functions deploy`. Add repo secrets: **SUPABASE_ACCESS_TOKEN**, **SUPABASE_PROJECT_REF**, **SUPABASE_DB_PASSWORD**. See [docs/GITHUB_ACTIONS_FREE_DEPLOY.md](docs/GITHUB_ACTIONS_FREE_DEPLOY.md).
- **Supabase Pro:** Alternatively use Dashboard **Integrations → GitHub** (set path to `supabase`, enable Deploy to production). See [docs/SUPABASE_SETUP_AND_GITHUB.md](docs/SUPABASE_SETUP_AND_GITHUB.md).
- **Secrets:** Do not commit `.env`. Use GitHub Actions secrets or Dashboard/CLI for branch secrets.

## Supabase MCP (Cursor)

The **Supabase MCP** server is available in Cursor (Settings → Tools & MCP). Use it to query the database, apply migrations, list tables, generate TypeScript types, and deploy Edge Functions.

- **Configure for this project:** Use `project_ref` = your Supabase project ref so the MCP only accesses this project. Prefer a development project, not production. See [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp).
- **Security:** Use read-only mode when only querying; never connect MCP to production data you don’t want exposed. See [Security risks](https://supabase.com/docs/guides/getting-started/mcp#security-risks).

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/MIGRATION_FROM_ORIGINAL.md](docs/MIGRATION_FROM_ORIGINAL.md) | What was migrated from Server_Management_Lunaverse and how it maps to Supabase. |
| [docs/SUPABASE_SETUP_AND_GITHUB.md](docs/SUPABASE_SETUP_AND_GITHUB.md) | Step-by-step Supabase + GitHub setup and branch/deploy. |
| [docs/PITFALLS_AND_TIPS.md](docs/PITFALLS_AND_TIPS.md) | Common pitfalls and tips (migrations, RLS, secrets). |
| [docs/GITHUB_REPO_SYNC_ONLY_THIS_DIR.md](docs/GITHUB_REPO_SYNC_ONLY_THIS_DIR.md) | How to create a GitHub repo that contains only this directory (no parent secrets). |

## Original project

The original **Server_Management_Lunaverse** repo (parent of this folder) is unchanged. It contains server scripts, nginx config, and `.env` with secrets — **do not** push the full parent repo to a public repo that might expose it. This directory is the safe, Supabase-only surface for GitHub.

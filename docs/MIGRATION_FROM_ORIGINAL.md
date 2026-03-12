# Migration from Server_Management_Lunaverse

This document describes what was brought over from the original **Server_Management_Lunaverse** repo and how it maps to Supabase.

## Source

- **Original repo:** `Server_Management_Lunaverse` (parent of `lunaverse-supabase`).
- **Purpose:** Migrate to Supabase so the stack is serverless (Postgres, Auth, Storage, Edge Functions) and safe to sync to GitHub (this directory only, no parent `.env` or server secrets).

## What lives where

| Original (server) | In this repo | Supabase / deployment |
|-------------------|--------------|------------------------|
| Hub (thegeeksnextdoor-homepage/) | `web/hub/` | Static: Supabase Storage + CDN, or Vercel/Netlify |
| Portfolio (portfolio/) | `web/portfolio/` | Same |
| Lab (lab.html + nginx auth) | `web/hub/lab.html` | Supabase Auth (e.g. email magic link or password) or Edge Function to gate `/lab` |
| Nginx routing (subdomains, proxies) | — | Use Supabase as API/DB; front ends can be on same host or separate (Vercel, custom domain) |
| PostgreSQL (Legacy Vault, etc.) | Schema in `supabase/migrations/` | Supabase Postgres; after migration enable RLS |
| Legacy Vault API (Rust :8001) | — | Reimplement as Edge Functions or external service (e.g. Cloud Run) calling Supabase |
| Lipsum Lap (:8000) | — | Edge Function or external serverless |
| Luna Chat (:7860) | — | Edge Function + Supabase Auth; LLM via external API |
| Predictive (:8002) | — | Edge Function or Cloud Run |
| Scripts (run-on-server.sh, nginx, etc.) | Not copied | Replaced by Supabase CLI, Dashboard, GitHub integration |

## Database migration (Postgres → Supabase)

- **RLS:** Row Level Security is *not* migrated from a dump. Enable RLS on tables after restore and add policies. See [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- **Roles:** Users/roles are not migrated; use Supabase’s managed roles (anon, service_role, authenticated).
- **Dump/restore:** For existing data, use [Migrate from Postgres to Supabase](https://supabase.com/docs/guides/platform/migrating-to-supabase/postgres) (dump/restore or logical replication). Then add migrations for any new schema changes so they are version-controlled here.
- **Schema first:** Prefer defining schema in `supabase/migrations/*.sql` rather than in the Dashboard, so branches and CI stay in sync.

## Content and design

- **Hub/portfolio:** Copy from original `thegeeksnextdoor-homepage/` and `portfolio/` into `web/`; do not invent copy. Design tokens: `--bg: #0a0a0c`, `--accent: #f59e0b`, Syne, DM Sans.
- **thekeyholders.org:** Content remains in the original repo under `ecosystem-website-project/content-sources/`. This repo can reference it or copy only what’s needed for a future thekeyholders site on Supabase.

## What stays in the original repo

- `.env` (all secrets)
- `scripts/`, `scripts/server/`, nginx configs
- Agent history (`docs/agent_history_convos/`), SERVER_APPS_AND_SERVICES_TABLE, etc.
- Any app source code (Legacy Vault, Luna Chat, etc.) until it’s rewritten or redeployed to use Supabase

This directory is the **Supabase-facing** slice: config, migrations, seed, Edge Functions, and static web assets that are safe to push to a dedicated GitHub repo.

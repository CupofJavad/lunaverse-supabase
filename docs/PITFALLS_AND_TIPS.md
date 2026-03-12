# Pitfalls and tips (Supabase migration)

Curated from [Supabase docs](https://supabase.com/docs), community posts, and migration guides. Apply these to avoid common failures.

## 1. Schema and migrations

- **Do not rely on the Dashboard for schema.** Creating or changing tables only in Supabase Studio means no version control and no consistent rollout across branches. Use the CLI and **migration files** in `supabase/migrations/`. See [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations).
- **Always test migrations locally first.** Run `supabase db reset` before pushing. A failed migration in production can leave the DB in a half-applied state. See [Troubleshooting](https://supabase.com/docs/guides/deployment/branching/troubleshooting).
- **Migration order matters.** Migration files run in timestamp order. After a rebase, timestamps can get out of order and break dependencies. Keep timestamps unique and sequential (e.g. `20250311120000_description.sql`). See [Fixing Supabase migrations](https://ftp.broadwayinfosys.com/blog/fixing-supabase-migrations-a-comprehensive-guide-1764797009).
- **Use `supabase db diff`** to generate migrations from local schema changes instead of hand-writing DDL when possible.

## 2. Row Level Security (RLS)

- **RLS is not migrated.** If you restore from a Postgres dump, RLS state and policies are not included. You must enable RLS on tables and add policies after restore. See [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- **Keep RLS simple.** Use RLS for **access control** (who can read/write which rows), not for complex business logic. Complex logic in RLS leads to hard-to-debug policies and performance issues. Put business logic in your app or Edge Functions. See [Supabase common mistakes](https://hrekov.com/blog/supabase-common-mistakes).

## 3. Secrets and .env

- **Never commit `.env` or `supabase/.env`.** Add them to `.gitignore`. Use `.env.example` with placeholder names only. Ref: [Managing config and secrets](https://supabase.com/docs/guides/local-development/managing-config).
- **Branch-specific secrets.** Secrets set for one branch are not copied to others. Set them per environment (e.g. `supabase secrets set --env-file ./supabase/.env` for each branch). See [Managing secrets for branches](https://supabase.com/docs/guides/deployment/branching#managing-secrets-for-branches).
- **Use `env(VAR)` in config.toml** for OAuth client secrets, SMTP passwords, etc., and supply values via `.env` or Dashboard/CLI secrets.

## 4. GitHub and path

- **Supabase directory path.** GitHub integration needs the **relative path from repo root** to the `supabase` directory. For this repo, the repo root *is* this directory, so the path is **`supabase`**. If you put this folder inside another repo, set the path accordingly (e.g. `lunaverse-supabase/supabase`). See [GitHub integration](https://supabase.com/docs/guides/deployment/branching/github-integration).
- **Only this directory in the repo.** To avoid leaking the parent project’s `.env` or scripts, the GitHub repo that connects to Supabase should contain **only** the contents of this directory.

## 5. Postgres migration from existing DB

- **Roles and users** are not migrated; recreate them in Supabase (use anon, service_role, authenticated). See [Postgres migration](https://supabase.com/docs/guides/platform/migrating-to-supabase/postgres).
- **Session pooler:** Use the **Session** pooler (port 5432) for pg_dump/pg_restore and logical replication. See connection strings in Dashboard → Settings → Database.
- **Large DBs:** For very large databases, consider compute size and restore parallelism; see the Postgres migration guide for resource table and `-j` recommendations.

## 6. Edge Functions and config

- **Declare Edge Functions in config.toml** so they deploy with the branch. Unlisted functions may not be deployed by the GitHub integration. See [Configuration](https://supabase.com/docs/guides/deployment/branching/configuration).
- **Production deploy** from GitHub deploys: storage buckets (in config), Edge Functions (in config), and new migrations. API/Auth/seed config can be overridden via `[remotes]` or secrets; see branching docs.

## 7. Supabase MCP (Cursor)

- Use **project scoping** (`project_ref`) so the MCP only talks to this project. Prefer a **development** project for MCP, not production. See [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp) and security recommendations there.
- **Read-only mode** is available for MCP; use it when you only need to query data and want to reduce risk.

## Checklist before first production push

- [ ] All schema changes are in `supabase/migrations/`, not only in the Dashboard.
- [ ] `supabase db reset` (or equivalent) runs successfully locally.
- [ ] `.env` and any `supabase/.env*` with secrets are in `.gitignore` and not committed.
- [ ] GitHub repo contains only this directory; parent repo is not pushed to the same remote.
- [ ] Supabase GitHub integration has the correct “relative path to Supabase directory.”
- [ ] Required status check for Supabase is enabled on the default branch so broken migrations block merge.

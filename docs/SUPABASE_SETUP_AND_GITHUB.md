# Supabase setup and GitHub sync

Step-by-step to get the Lunaverse Supabase project running and synced with GitHub **without exposing the parent repo or secrets**.

## 1. Use only this directory for the GitHub repo

- **Option A — New repo from this folder:** Create a new GitHub repository. Clone it, then copy the *contents* of `lunaverse-supabase` into the clone’s root (so the repo root = this folder). Commit and push. The remote will never see the parent `Server_Management_Lunaverse` or its `.env`.
- **Option B — Subtree / separate branch:** From the parent repo, use `git subtree split` or a branch that only contains `lunaverse-supabase/` and push that to a different remote. Ensure `.env` and parent-only paths are not in that branch.

**Rule:** Anything you push to the Supabase-connected GitHub repo must be only what’s inside this directory. No parent `.env`, no `../scripts`, no server secrets.

## 2. Install Supabase CLI

```bash
brew install supabase/tap/supabase
# Or: npm install supabase --save-dev
```

Requires Docker (or compatible runtime) for `supabase start`.

## 3. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Note **Project ref** (Settings → General) and **API URL**, **anon key**, **service_role key** (Settings → API).

## 4. Local env (never commit)

```bash
cp .env.example .env
```

Edit `.env` and set:

- `SUPABASE_URL` = your project API URL  
- `SUPABASE_ANON_KEY` = anon/public key  
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (keep secret)

Optional: if you use `env()` in `supabase/config.toml` (e.g. OAuth secrets), add those to `.env`. Do **not** commit `.env`.

## 5. Link to the remote project

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

When prompted, enter the database password from the Dashboard (Settings → Database).

## 6. Run Supabase locally

```bash
supabase start
```

Use the printed URLs: API (54321), Studio (54323), DB (54322). Apply migrations locally:

```bash
supabase db reset
# Or, without reset: supabase db push (for linked remote)
```

## 7. Deploy from GitHub (choose one)

### Option A — Free: GitHub Actions (no Pro required)

Use the workflow in `.github/workflows/deploy-supabase.yml`. On push to `main` (when `supabase/**` changes), it runs `supabase db push` and `supabase functions deploy`. Add repo secrets: **SUPABASE_ACCESS_TOKEN**, **SUPABASE_PROJECT_REF**, **SUPABASE_DB_PASSWORD**. See [docs/GITHUB_ACTIONS_FREE_DEPLOY.md](GITHUB_ACTIONS_FREE_DEPLOY.md).

### Option B — Supabase Pro: native GitHub integration

1. In Dashboard: **Project Settings → Integrations → GitHub**.
2. Enable the integration and authorize the GitHub org/repo.
3. **Important:** Set “Relative path to Supabase directory” to **`supabase`** (because the repo root is this directory).
4. Optionally enable **Automatic branching** (Git branch ↔ Supabase branch) and **Deploy to production** (push to main deploys migrations, Edge Functions, storage config).

Ref: [GitHub integration](https://supabase.com/docs/guides/deployment/branching/github-integration). Requires a paid Pro plan.

## 8. Secrets for branches

- **Local:** Use `.env` and `env(VAR)` in `config.toml`; keep `.env` out of git.
- **Remote branches:** Use Dashboard **Settings → Vault** or CLI:
  ```bash
  supabase secrets set --env-file ./supabase/.env
  ```
  Secrets are per-branch; set them for each environment. See [Managing config and secrets](https://supabase.com/docs/guides/local-development/managing-config) and [Managing secrets for branches](https://supabase.com/docs/guides/deployment/branching#managing-secrets-for-branches).

## 9. Recommended: required status check

In GitHub repo **Settings → Branches**, add a required status check for the Supabase integration so PRs cannot merge when migration checks fail. See [Preventing migration failures](https://supabase.com/docs/guides/deployment/branching/github-integration#preventing-migration-failures).

## 10. Deploying migrations to production

- **Via GitHub:** With “Deploy to production” enabled, push (or merge) to your production branch; Supabase runs new migrations and deploys Edge Functions/storage from `config.toml`.
- **Via CLI:**
  ```bash
  supabase link --project-ref YOUR_PROD_REF
  supabase db push
  supabase functions deploy
  ```

Never commit database passwords or service role keys. Use the Dashboard or CLI secrets for each environment.

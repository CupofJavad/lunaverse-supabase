# Free deploy: GitHub Actions (no Supabase Pro)

Supabase’s **native GitHub integration** (branching, deploy-on-push) is a **Pro** feature. You can get the same “push to deploy” behavior for **free** using **GitHub Actions** and the **Supabase CLI**.

## How it works

A workflow in `.github/workflows/deploy-supabase.yml` runs on every push to `main` that touches `supabase/**`. It:

1. Checks out the repo
2. Installs the Supabase CLI (`supabase/setup-cli`)
3. Links to your project (using your token and DB password)
4. Runs `supabase db push` (applies pending migrations)
5. Runs `supabase functions deploy` (deploys Edge Functions; step is optional and won’t fail if you have none)

No Supabase Pro or paid plan required.

## One-time setup: add GitHub secrets

In your **GitHub repo** (CupofJavad/lunaverse-supabase): **Settings → Secrets and variables → Actions → New repository secret**. Add these three:

| Secret name | Where to get it |
|-------------|-----------------|
| **SUPABASE_ACCESS_TOKEN** | [Supabase Dashboard](https://supabase.com/dashboard) → **Account** (top-left) → **Access Tokens** → Generate new token. Copy and save it; you won’t see it again. |
| **SUPABASE_PROJECT_REF** | In your **project** → **Settings** → **General** → **Reference ID** (e.g. `abcdefghijklmnop`). |
| **SUPABASE_DB_PASSWORD** | The **database password** you set when creating the project. If you lost it: **Settings** → **Database** → **Database password** → Reset database password. |

Names must be exactly as above so the workflow can use them.

## When it runs

- **Trigger:** Push to the `main` branch that changes anything under `supabase/` (migrations, `config.toml`, functions, etc.).
- **Result:** Pending migrations are applied to the linked Supabase project; Edge Functions are deployed if present.

## Optional: run only on main

The workflow is already limited to `branches: [main]`. To deploy only when a release or tag is created, you can change the `on:` section to `release: published` or add a manual `workflow_dispatch` trigger (see [GitHub Actions docs](https://docs.github.com/en/actions)).

## If "Link" or DB auth fails in CI

Sometimes `supabase link` in CI can fail with SASL/SCRAM errors. If that happens: (1) Confirm the database password is correct (reset it in Dashboard → Database if needed). (2) Ensure the project ref has no extra spaces. (3) See [supabase/cli#3500](https://github.com/supabase/cli/issues/3500) for workarounds.

## References

- [Deploying Supabase migrations from GitHub Actions](https://www.andyhorn.dev/blog/deploying-supabase-migrations-from-github-actions)
- [supabase/setup-cli](https://github.com/supabase/setup-cli)

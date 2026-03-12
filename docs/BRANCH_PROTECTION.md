# Branch protection (optional)

So that broken migrations don’t get merged, require the **Deploy to Supabase** workflow to pass before merging into `main`.

## Steps (GitHub UI)

1. Open **https://github.com/CupofJavad/lunaverse-supabase**.
2. Go to **Settings** → **Branches**.
3. Under **Branch protection rules**, click **Add rule** (or edit the rule for `main`).
4. **Branch name pattern:** `main`.
5. Enable **Require status checks to pass before merging**.
6. In **Search for status checks**, type `deploy` (the job name in `.github/workflows/deploy-supabase.yml`). Select **deploy** when it appears.
7. Save.

After this, any PR into `main` must have the “Deploy to Supabase” workflow run and the **deploy** job green before it can be merged.

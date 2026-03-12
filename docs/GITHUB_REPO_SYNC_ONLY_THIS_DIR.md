# Syncing only this directory to GitHub

To avoid exposing the parent **Server_Management_Lunaverse** repo (and its `.env`, scripts, or secrets), use a GitHub repo that contains **only** the contents of `lunaverse-supabase`.

## Option 1: New repo with this folder as root (recommended)

1. Create a **new empty repository** on GitHub (e.g. `lunaverse-supabase`).
2. On your machine, create a new directory and clone that repo:
   ```bash
   mkdir ~/lunaverse-supabase-repo && cd ~/lunaverse-supabase-repo
   git clone https://github.com/YOUR_USER/lunaverse-supabase.git .
   ```
3. Copy **all contents** of `Server_Management_Lunaverse/lunaverse-supabase` into the clone (so that the repo root has `supabase/`, `web/`, `docs/`, `.gitignore`, `README.md`, `.env.example`):
   ```bash
   cp -R /path/to/Server_Management_Lunaverse/lunaverse-supabase/* .
   cp /path/to/Server_Management_Lunaverse/lunaverse-supabase/.gitignore .
   cp /path/to/Server_Management_Lunaverse/lunaverse-supabase/.env.example .
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Initial Supabase migration layout"
   git push -u origin main
   ```
5. In Supabase Dashboard, connect this GitHub repo (Integrations → GitHub) and set the Supabase directory path to **`supabase`**.

From now on, work and push from **this repo**; the parent `Server_Management_Lunaverse` stays separate and is never pushed to this remote.

## Option 2: Git subtree (one parent repo, two remotes)

If you want to keep a single clone of the parent repo but push only `lunaverse-supabase` to a different GitHub repo:

1. Add the Supabase repo as a second remote:
   ```bash
   cd /path/to/Server_Management_Lunaverse
   git remote add supabase-gh https://github.com/YOUR_USER/lunaverse-supabase.git
   ```
2. Push only the subtree (contents of `lunaverse-supabase`) to that remote:
   ```bash
   git subtree push --prefix=lunaverse-supabase supabase-gh main
   ```
   This creates/updates `main` on `supabase-gh` with only the files under `lunaverse-supabase/`. Your parent `.env` and other files are not included.

To pull back changes made in the Supabase repo:

```bash
git subtree pull --prefix=lunaverse-supabase supabase-gh main
```

## What must never be in the GitHub repo

- `.env` or any file containing real keys, passwords, or tokens
- Parent paths (e.g. `../.env`, `../scripts/`)
- References to the full Server_Management_Lunaverse tree that could leak paths or secrets

The Supabase GitHub integration only needs the `supabase/` directory (and optionally `web/`, `docs/` for your own reference). Keeping the repo limited to this directory is the safest way to avoid accidental exposure.

# Static web assets (hub + portfolio)

These files are copied from the original **Server_Management_Lunaverse** project for deployment with the Supabase migration.

- **hub/** — Home page (`index.html`) and Lab (`lab.html`) for thegeeksnextdoor.com. Lab was originally protected by nginx HTTP auth; with Supabase you can use Supabase Auth (e.g. magic link or password) or an Edge Function to gate access.
- **portfolio/** — Javad’s portfolio (`index.html`) and project pages (`legacy-vault.html`, `predictive-modeling-equations.html`).

## Deployment options

1. **Supabase Storage:** Upload to a public bucket and serve via Supabase CDN (or use Storage + a small Edge Function to serve index.html for SPA-style routes).
2. **Vercel / Netlify:** Use this `web/` folder as the public or build output root; connect the same GitHub repo (this directory only) and point custom domain (e.g. thegeeksnextdoor.com) there. Backend/API calls go to your Supabase project.
3. **Edge Function:** Serve these files from an Edge Function that reads from Storage or embeds static HTML for simple cases.

Do not add secrets or parent-repo paths here; this folder is safe to sync to GitHub.

-- Initial schema for Lunaverse migration to Supabase
-- Legacy Vault (estate planning) and app tables can be added here.
-- Prefer migrations over UI: https://supabase.com/docs/guides/deployment/database-migrations

-- Enable extensions if needed (e.g. for Legacy Vault / UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Placeholder: app-specific tables go in later migrations.
-- Example for Legacy Vault–style users (Supabase Auth handles auth.users; this is app data if needed):
-- CREATE TABLE public.profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   display_name TEXT,
--   created_at TIMESTAMPTZ DEFAULT now(),
--   updated_at TIMESTAMPTZ DEFAULT now()
-- );
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Lab / hub: no DB required for static Lab; use Supabase Auth for protected routes if desired.

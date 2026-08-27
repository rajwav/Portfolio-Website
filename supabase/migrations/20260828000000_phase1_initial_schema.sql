-- ============================================================================
-- PHASE 1 MIGRATION: INITIAL SCHEMA, SECURITY, RLS & SEED DATA (PRODUCTION HARDENED)
-- Project: Raj (Pitambar Panda) Personal Engineering Laboratory
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. AUTHENTICATION & SECURITY DEFINER ROLES
-- ============================================================================

-- Table storing authorized admin users linked strictly to Supabase Auth UUIDs
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strict Security Definer function: depends exclusively on auth.uid() matching admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================================
-- 2. AUDIT LOGGING SYSTEM (IMMUTABLE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ROLLBACK', 'UPLOAD_ASSET', 'DELETE_ASSET')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('SITE_CONFIG', 'PROJECT', 'TECH_STACK', 'LAB_MODULE', 'PATH_MILESTONE', 'SOCIAL_LINK', 'RELEASE', 'STORAGE')),
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.admin_audit_log(action);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view audit log" ON public.admin_audit_log;
CREATE POLICY "Admin view audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Trusted Security Definer helper for appending audit entries
CREATE OR REPLACE FUNCTION public.append_audit_log(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only verified administrators can create audit records.';
  END IF;

  v_admin_id := auth.uid();

  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    v_admin_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    NOW()
  );
END;
$$;

-- ============================================================================
-- 3. DOMAIN TABLES & CONSTRAINTS
-- ============================================================================

-- A. Master Site Configuration (Enforced Singleton via id = 1)
CREATE TABLE IF NOT EXISTS public.site_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name TEXT NOT NULL DEFAULT 'Pitambar Panda' CHECK (length(full_name) BETWEEN 2 AND 100),
  display_name TEXT NOT NULL DEFAULT 'Raj' CHECK (length(display_name) BETWEEN 1 AND 50),
  hero_intro TEXT NOT NULL DEFAULT 'HELLO, I''M' CHECK (length(hero_intro) <= 50),
  hero_metadata TEXT NOT NULL DEFAULT 'VSSUT CSE · ODISHA, INDIA · 2026' CHECK (length(hero_metadata) <= 120),
  hero_quote TEXT NOT NULL DEFAULT 'I BUILD TO UNDERSTAND. I ENGINEER TO CREATE.' CHECK (length(hero_quote) <= 250),
  hero_kinetic_words TEXT[] NOT NULL DEFAULT ARRAY['INTELLIGENT', 'AUTONOMOUS', 'SYSTEMS', 'SOFTWARE'],
  about_headline TEXT NOT NULL DEFAULT 'I learn by building.' CHECK (length(about_headline) <= 150),
  about_paragraphs TEXT[] NOT NULL,
  about_tags TEXT[] NOT NULL,
  contact_email TEXT NOT NULL DEFAULT 'theraj.wav@gmail.com' CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_headline TEXT NOT NULL DEFAULT 'LET''S BUILD SOMETHING INTERESTING.' CHECK (length(contact_headline) <= 150),
  contact_subtext TEXT NOT NULL CHECK (length(contact_subtext) <= 300),
  location_text TEXT NOT NULL DEFAULT 'VSSUT BURLA · ODISHA, INDIA' CHECK (length(location_text) <= 100),
  colophon_text TEXT NOT NULL DEFAULT 'PITAMBAR PANDA / RAJ · © 2026 · INNOSPHERE' CHECK (length(colophon_text) <= 150),
  resume_url TEXT NOT NULL DEFAULT '/resume.pdf' CHECK (
    resume_url ~ '^(/resume\.pdf|https://[a-zA-Z0-9.-]+\.supabase\.co/storage/v1/object/public/public-assets/resumes/[a-zA-Z0-9._-]+\.pdf)$'
  ),
  section_visibility JSONB NOT NULL DEFAULT '{"hero":true,"about":true,"lab":true,"path":true,"work":true,"tech":true,"contact":true}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. Engineering Archive Projects (Derived numbering via display_order)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
  category TEXT NOT NULL CHECK (length(category) BETWEEN 2 AND 60),
  badge TEXT NOT NULL CHECK (length(badge) BETWEEN 2 AND 40),
  tagline TEXT NOT NULL CHECK (length(tagline) BETWEEN 5 AND 300),
  systems_specs TEXT[] NOT NULL,
  tech_stack_summary TEXT NOT NULL CHECK (length(tech_stack_summary) <= 120),
  github_url TEXT NOT NULL CHECK (github_url ~ '^https?://github\.com/'),
  live_url TEXT CHECK (live_url IS NULL OR live_url ~ '^https?://'),
  image_url TEXT NOT NULL CHECK (
    image_url ~ '^(/images/projects/[a-z0-9._-]+\.svg|https://[a-zA-Z0-9.-]+\.supabase\.co/storage/v1/object/public/public-assets/projects/[a-zA-Z0-9._-]+)$'
  ),
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- C. Tools of the Trade (Tech Stack Decals & Legend Pills)
CREATE TABLE IF NOT EXISTS public.tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_slug TEXT NOT NULL UNIQUE CHECK (tech_slug ~ '^[a-z0-9-]+$'),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 40),
  decal_url TEXT NOT NULL CHECK (
    decal_url ~ '^(/images/tech/[a-z0-9._-]+\.svg|https://[a-zA-Z0-9.-]+\.supabase\.co/storage/v1/object/public/public-assets/tech/[a-zA-Z0-9._-]+)$'
  ),
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- D. The Lab Modules
CREATE TABLE IF NOT EXISTS public.lab_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code TEXT NOT NULL UNIQUE CHECK (length(module_code) <= 30),
  module_status TEXT NOT NULL CHECK (length(module_status) <= 40),
  subtitle TEXT NOT NULL CHECK (length(subtitle) <= 80),
  specs TEXT[] NOT NULL,
  toolchain TEXT[] NOT NULL,
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E. The Path Milestones
CREATE TABLE IF NOT EXISTS public.path_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL UNIQUE CHECK (length(year) BETWEEN 4 AND 10),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 2 AND 80),
  organization TEXT NOT NULL CHECK (length(organization) BETWEEN 2 AND 100),
  description TEXT NOT NULL CHECK (length(description) <= 500),
  context_chip TEXT NOT NULL CHECK (length(context_chip) <= 40),
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- F. Social Profiles
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_slug TEXT NOT NULL UNIQUE CHECK (platform_slug ~ '^[a-z0-9-]+$'),
  label TEXT NOT NULL CHECK (length(label) BETWEEN 2 AND 30),
  handle TEXT NOT NULL CHECK (length(handle) BETWEEN 1 AND 60),
  action_text TEXT NOT NULL CHECK (length(action_text) <= 30),
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- G. Published Release Snapshots (Atomic Publish Boundary with Single-Current Release Enforcement)
CREATE TABLE IF NOT EXISTS public.portfolio_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INT GENERATED ALWAYS AS IDENTITY UNIQUE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  payload JSONB NOT NULL,
  published_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint guaranteeing exactly ONE current release at any time
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_current_release 
  ON public.portfolio_releases(is_current) 
  WHERE is_current = true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(display_order ASC) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_tech_stack_order ON public.tech_stack(display_order ASC) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_lab_modules_order ON public.lab_modules(display_order ASC) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_path_milestones_order ON public.path_milestones(display_order ASC) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_social_links_order ON public.social_links(display_order ASC) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_releases_version_desc ON public.portfolio_releases(version DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_releases ENABLE ROW LEVEL SECURITY;

-- 1. admin_users: Admin-only inspection
DROP POLICY IF EXISTS "Admin view admin list" ON public.admin_users;
CREATE POLICY "Admin view admin list" ON public.admin_users
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 2. site_config: Admin-only management
DROP POLICY IF EXISTS "Admin manage site config" ON public.site_config;
CREATE POLICY "Admin manage site config" ON public.site_config
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Working Entity Tables: Admin full management (Public reads exclusively via release snapshot)
DROP POLICY IF EXISTS "Admin manage projects" ON public.projects;
CREATE POLICY "Admin manage projects" ON public.projects
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage tech stack" ON public.tech_stack;
CREATE POLICY "Admin manage tech stack" ON public.tech_stack
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage lab modules" ON public.lab_modules;
CREATE POLICY "Admin manage lab modules" ON public.lab_modules
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage milestones" ON public.path_milestones;
CREATE POLICY "Admin manage milestones" ON public.path_milestones
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage social links" ON public.social_links;
CREATE POLICY "Admin manage social links" ON public.social_links
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. portfolio_releases: Public reads ONLY the active is_current release; Admin reads full history
DROP POLICY IF EXISTS "Public read current release only" ON public.portfolio_releases;
CREATE POLICY "Public read current release only" ON public.portfolio_releases
  FOR SELECT
  USING (is_current = true);

DROP POLICY IF EXISTS "Admin read all releases" ON public.portfolio_releases;
CREATE POLICY "Admin read all releases" ON public.portfolio_releases
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 5. STORAGE BUCKET & ASSET POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read portfolio assets" ON storage.objects;
CREATE POLICY "Public read portfolio assets" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'public-assets' AND
    name ~ '^(resumes|projects|tech)/'
  );

DROP POLICY IF EXISTS "Admin upload portfolio assets" ON storage.objects;
CREATE POLICY "Admin upload portfolio assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'public-assets' AND
    public.is_admin() AND
    name ~ '^(resumes|projects|tech)/'
  );

DROP POLICY IF EXISTS "Admin update portfolio assets" ON storage.objects;
CREATE POLICY "Admin update portfolio assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'public-assets' AND
    public.is_admin() AND
    name ~ '^(resumes|projects|tech)/'
  )
  WITH CHECK (
    bucket_id = 'public-assets' AND
    public.is_admin() AND
    name ~ '^(resumes|projects|tech)/'
  );

DROP POLICY IF EXISTS "Admin delete portfolio assets" ON storage.objects;
CREATE POLICY "Admin delete portfolio assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'public-assets' AND
    public.is_admin() AND
    name ~ '^(resumes|projects|tech)/'
  );

-- ============================================================================
-- 6. ATOMIC PUBLISH & COMPLETE ROLLBACK RPCs (CONCURRENCY HARDENED)
-- ============================================================================

-- A. Publish Live Release RPC (Strictly Authenticated Admin Session)
CREATE OR REPLACE FUNCTION public.publish_release()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payload JSONB;
  v_release_id UUID;
  v_version INT;
  v_admin_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Administrative privileges required to publish releases.';
  END IF;

  -- Acquire exclusive transaction-level advisory lock to guarantee serialized execution
  PERFORM pg_advisory_xact_lock(hashtext('portfolio_release_lock'));

  v_admin_id := auth.uid();

  -- Compile complete active state into an atomic snapshot
  SELECT jsonb_build_object(
    'site_config', (SELECT row_to_json(sc) FROM (SELECT * FROM public.site_config WHERE id = 1) sc),
    'projects', (SELECT jsonb_agg(row_to_json(p)) FROM (SELECT * FROM public.projects WHERE is_enabled = true ORDER BY display_order ASC) p),
    'tech_stack', (SELECT jsonb_agg(row_to_json(ts)) FROM (SELECT * FROM public.tech_stack WHERE is_enabled = true ORDER BY display_order ASC) ts),
    'lab_modules', (SELECT jsonb_agg(row_to_json(lm)) FROM (SELECT * FROM public.lab_modules WHERE is_enabled = true ORDER BY display_order ASC) lm),
    'path_milestones', (SELECT jsonb_agg(row_to_json(pm)) FROM (SELECT * FROM public.path_milestones WHERE is_enabled = true ORDER BY display_order ASC) pm),
    'social_links', (SELECT jsonb_agg(row_to_json(sl)) FROM (SELECT * FROM public.social_links WHERE is_enabled = true ORDER BY display_order ASC) sl),
    'published_at', NOW()
  ) INTO v_payload;

  -- 1. Retire previous current release
  UPDATE public.portfolio_releases SET is_current = false WHERE is_current = true;

  -- 2. Insert new current release
  INSERT INTO public.portfolio_releases (payload, published_by, is_current, published_at)
  VALUES (v_payload, v_admin_id, true, NOW())
  RETURNING id, version INTO v_release_id, v_version;

  -- 3. Append to trusted audit log
  PERFORM public.append_audit_log(
    'PUBLISH',
    'RELEASE',
    v_release_id::text,
    jsonb_build_object('version', v_version)
  );

  RETURN jsonb_build_object(
    'release_id', v_release_id,
    'version', v_version,
    'published_at', NOW(),
    'status', 'SUCCESS'
  );
END;
$$;

-- B. Complete State Rollback RPC (Strictly Authenticated Admin Session)
CREATE OR REPLACE FUNCTION public.rollback_release(target_version INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_payload JSONB;
  v_new_release_id UUID;
  v_new_version INT;
  v_admin_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Administrative privileges required to perform rollbacks.';
  END IF;

  -- Acquire exclusive transaction-level advisory lock to guarantee serialized execution
  PERFORM pg_advisory_xact_lock(hashtext('portfolio_release_lock'));

  v_admin_id := auth.uid();

  -- 1. Verify target version exists in history
  SELECT payload INTO v_target_payload
  FROM public.portfolio_releases
  WHERE version = target_version;

  IF v_target_payload IS NULL THEN
    RAISE EXCEPTION 'Rollback target version % does not exist in release history.', target_version;
  END IF;

  -- 2. Atomically retire previous current release
  UPDATE public.portfolio_releases SET is_current = false WHERE is_current = true;

  -- 3. Insert new forward release promoting historical payload (auditable)
  INSERT INTO public.portfolio_releases (payload, published_by, is_current, published_at)
  VALUES (
    jsonb_set(v_target_payload, '{rolled_back_from_version}', to_jsonb(target_version)),
    v_admin_id,
    true,
    NOW()
  )
  RETURNING id, version INTO v_new_release_id, v_new_version;

  -- 4. Restore ALL site_config fields completely
  UPDATE public.site_config SET
    full_name = (v_target_payload->'site_config'->>'full_name'),
    display_name = (v_target_payload->'site_config'->>'display_name'),
    hero_intro = (v_target_payload->'site_config'->>'hero_intro'),
    hero_metadata = (v_target_payload->'site_config'->>'hero_metadata'),
    hero_quote = (v_target_payload->'site_config'->>'hero_quote'),
    hero_kinetic_words = COALESCE(ARRAY(SELECT jsonb_array_elements_text(v_target_payload->'site_config'->'hero_kinetic_words')), ARRAY[]::text[]),
    about_headline = (v_target_payload->'site_config'->>'about_headline'),
    about_paragraphs = COALESCE(ARRAY(SELECT jsonb_array_elements_text(v_target_payload->'site_config'->'about_paragraphs')), ARRAY[]::text[]),
    about_tags = COALESCE(ARRAY(SELECT jsonb_array_elements_text(v_target_payload->'site_config'->'about_tags')), ARRAY[]::text[]),
    contact_email = (v_target_payload->'site_config'->>'contact_email'),
    contact_headline = (v_target_payload->'site_config'->>'contact_headline'),
    contact_subtext = (v_target_payload->'site_config'->>'contact_subtext'),
    location_text = (v_target_payload->'site_config'->>'location_text'),
    colophon_text = (v_target_payload->'site_config'->>'colophon_text'),
    resume_url = (v_target_payload->'site_config'->>'resume_url'),
    section_visibility = (v_target_payload->'site_config'->'section_visibility'),
    updated_at = NOW()
  WHERE id = 1;

  -- 5. Restore Projects
  DELETE FROM public.projects;
  INSERT INTO public.projects (id, slug, name, category, badge, tagline, systems_specs, tech_stack_summary, github_url, live_url, image_url, display_order, is_enabled, updated_at)
  SELECT 
    COALESCE((elem->>'id')::uuid, gen_random_uuid()),
    elem->>'slug',
    elem->>'name',
    elem->>'category',
    elem->>'badge',
    elem->>'tagline',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(elem->'systems_specs')), ARRAY[]::text[]),
    elem->>'tech_stack_summary',
    elem->>'github_url',
    elem->>'live_url',
    elem->>'image_url',
    (elem->>'display_order')::int,
    COALESCE((elem->>'is_enabled')::boolean, true),
    NOW()
  FROM jsonb_array_elements(v_target_payload->'projects') AS elem;

  -- 6. Restore Tech Stack
  DELETE FROM public.tech_stack;
  INSERT INTO public.tech_stack (id, tech_slug, display_name, decal_url, display_order, is_enabled, updated_at)
  SELECT 
    COALESCE((elem->>'id')::uuid, gen_random_uuid()),
    elem->>'tech_slug',
    elem->>'display_name',
    elem->>'decal_url',
    (elem->>'display_order')::int,
    COALESCE((elem->>'is_enabled')::boolean, true),
    NOW()
  FROM jsonb_array_elements(v_target_payload->'tech_stack') AS elem;

  -- 7. Restore Lab Modules
  DELETE FROM public.lab_modules;
  INSERT INTO public.lab_modules (id, module_code, module_status, subtitle, specs, toolchain, display_order, is_enabled, updated_at)
  SELECT 
    COALESCE((elem->>'id')::uuid, gen_random_uuid()),
    elem->>'module_code',
    elem->>'module_status',
    elem->>'subtitle',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(elem->'specs')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(elem->'toolchain')), ARRAY[]::text[]),
    (elem->>'display_order')::int,
    COALESCE((elem->>'is_enabled')::boolean, true),
    NOW()
  FROM jsonb_array_elements(v_target_payload->'lab_modules') AS elem;

  -- 8. Restore Path Milestones
  DELETE FROM public.path_milestones;
  INSERT INTO public.path_milestones (id, year, title, organization, description, context_chip, display_order, is_enabled, updated_at)
  SELECT 
    COALESCE((elem->>'id')::uuid, gen_random_uuid()),
    elem->>'year',
    elem->>'title',
    elem->>'organization',
    elem->>'description',
    elem->>'context_chip',
    (elem->>'display_order')::int,
    COALESCE((elem->>'is_enabled')::boolean, true),
    NOW()
  FROM jsonb_array_elements(v_target_payload->'path_milestones') AS elem;

  -- 9. Restore Social Links
  DELETE FROM public.social_links;
  INSERT INTO public.social_links (id, platform_slug, label, handle, action_text, url, display_order, is_enabled, updated_at)
  SELECT 
    COALESCE((elem->>'id')::uuid, gen_random_uuid()),
    elem->>'platform_slug',
    elem->>'label',
    elem->>'handle',
    elem->>'action_text',
    elem->>'url',
    (elem->>'display_order')::int,
    COALESCE((elem->>'is_enabled')::boolean, true),
    NOW()
  FROM jsonb_array_elements(v_target_payload->'social_links') AS elem;

  -- 10. Append to trusted audit log
  PERFORM public.append_audit_log(
    'ROLLBACK',
    'RELEASE',
    v_new_release_id::text,
    jsonb_build_object('new_version', v_new_version, 'promoted_from_version', target_version)
  );

  RETURN jsonb_build_object(
    'new_version', v_new_version,
    'promoted_from_version', target_version,
    'published_at', NOW(),
    'status', 'SUCCESS'
  );
END;
$$;

-- ============================================================================
-- 7. EXPLICIT PERMISSIONS & RPC EXECUTE RESTRICTIONS
-- ============================================================================

-- Table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.portfolio_releases TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Revoke default public execution and grant strictly to authenticated/anon roles
REVOKE EXECUTE ON FUNCTION public.publish_release() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_release() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rollback_release(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rollback_release(INT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.append_audit_log(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.append_audit_log(TEXT, TEXT, TEXT, JSONB) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ============================================================================
-- 8. INITIAL SEED DATA (CURRENT VERIFIED PORTFOLIO STATE)
-- ============================================================================

INSERT INTO public.site_config (
  id, full_name, display_name, hero_intro, hero_metadata, hero_quote, hero_kinetic_words,
  about_headline, about_paragraphs, about_tags,
  contact_email, contact_headline, contact_subtext, location_text, colophon_text,
  resume_url
) VALUES (
  1,
  'Pitambar Panda',
  'Raj',
  'HELLO, I''M',
  'VSSUT CSE · ODISHA, INDIA · 2026',
  'I BUILD TO UNDERSTAND. I ENGINEER TO CREATE.',
  ARRAY['INTELLIGENT', 'AUTONOMOUS', 'SYSTEMS', 'SOFTWARE'],
  'I learn by building.',
  ARRAY[
    'I started by breaking down physics and mechanics from first principles—teaching conceptual science and understanding how complex systems operate.',
    'Now in Computer Science at VSSUT Burla, I apply that same first-principles engineering to local-first AI, persistent memory engines, water intelligence systems, and autonomous software.',
    'I don''t wait for permission or follow tutorials. I design architectures, run tests, and ship software that solves real technical problems.'
  ],
  ARRAY['AI & COGNITIVE SYSTEMS', 'PERSISTENT MEMORY', 'ROBOTICS & EMBEDDED', 'FIRST-PRINCIPLES LEARNING'],
  'theraj.wav@gmail.com',
  'LET''S BUILD SOMETHING INTERESTING.',
  'I''m always interested in ideas worth exploring, systems worth understanding, and things worth building.',
  'VSSUT BURLA · ODISHA, INDIA',
  'PITAMBAR PANDA / RAJ · © 2026 · INNOSPHERE',
  '/resume.pdf'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (slug, name, category, badge, tagline, systems_specs, tech_stack_summary, github_url, live_url, image_url, display_order, is_enabled) VALUES
('raj-os', 'RAJ Assistant / RAJ OS', 'LOCAL-FIRST AI SYSTEM', 'WORKING CORE', 'Personal AI designed around persistent memory, cognitive intent routing, and permission-controlled local execution.', ARRAY['▸ Memory: SQLite WAL Mode & FTS5 Document Brain', '▸ Routing: Multi-tier Cognitive Intent Engine', '▸ Security: 5-Tier Permission Rings Architecture', '▸ Models: Multi-LLM Gateway (Cloud & Local)'], 'Python 3.11+ · SQLite · Multi-LLM · FTS5 · macOS/Linux', 'https://github.com/rajwav/raj-assistant', NULL, '/images/projects/01-raj-os.svg', 1, true),
('aquaneon', 'AquaNeon', 'AI WATER INTELLIGENCE', 'LIVE PLATFORM', 'Telemetry ingestion, multivariate anomaly detection, TreeSHAP feature attributions, and digital-twin SCADA simulation.', ARRAY['▸ Detection: Isolation Forest & Balanced Random Forest', '▸ Explainability: TreeSHAP Feature Attributions', '▸ Forecasting: HistGradientBoosting 24h Telemetry', '▸ Simulation: SCADA Actuator Digital Twin Engine'], 'FastAPI · TreeSHAP · Scikit-Learn · Streamlit · Render', 'https://github.com/rajwav/neon_water_project', 'https://autonex-aqua-neon.onrender.com/', '/images/projects/02-aquaneon.svg', 2, true),
('tara', 'TARA', 'PERSONAL AI ARCHITECTURE', 'ARCHITECTURE EXPERIMENT', 'Lightweight personal AI architecture engineered in Python for Apple Silicon with safe macOS system actions.', ARRAY['▸ Inference: Single-Request LLM Streaming', '▸ Brain: Groq API with Local Ollama Fallback', '▸ Memory: Non-destructive Episodic Fact Extraction', '▸ Gateway: Audited macOS Action Execution & Audio VAD'], 'Python · Groq · Ollama · SQLite · Audio VAD · Apple Silicon', 'https://github.com/rajwav/TARA', NULL, '/images/projects/03-tara.svg', 3, true),
('samvad', 'Samvad', 'REAL-TIME SOFTWARE', 'WEB PROTOTYPE', 'Real-time communication and collaborative workspace engineered with modern web standards and responsive architecture.', ARRAY['▸ Framework: Next.js 16 App Router & React 19', '▸ Workspace: Low-Latency Dialogue & Collaboration', '▸ Design: Modular Component Architecture'], 'Next.js 16 · React 19 · TypeScript · Responsive CSS', 'https://github.com/rajwav/samvad', NULL, '/images/projects/04-samvad.svg', 4, true),
('the-lab', 'THE LAB', 'EXPERIMENTS & PROTOTYPES', 'EXPLORATORY WORK', 'A continuous digital laboratory for ongoing experiments, sensor telemetry, edge AI, and hardware-software fusion.', ARRAY['▸ Prototypes: Sensor Fusion & Edge Computing Models', '▸ Explorations: Autonomous Agent Orchestration', '▸ Inquiry: Computational Physics & Interactive Tools'], 'C++ · Python · Edge Telemetry · Micro-controllers · Linux', 'https://github.com/rajwav/rajwav', NULL, '/images/projects/05-the-lab.svg', 5, true),
('innosphere', 'INNOSPHERE', 'LONG-TERM VISION', 'DEEP-TECH DIRECTION', 'Long-term deep-tech direction exploring autonomous robotics, edge intelligence, and physical-world computing.', ARRAY['▸ Domain: Autonomous Robotics & Edge Intelligence', '▸ Focus: Physical Computing & Distributed Telemetry', '▸ Method: First-Principles Engineering & Continuous Shipping'], 'Autonomous Systems · Robotics · Deep Tech · AI Infrastructure', 'https://github.com/rajwav', NULL, '/images/projects/06-innosphere.svg', 6, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tech_stack (tech_slug, display_name, decal_url, display_order, is_enabled) VALUES
('python', 'PYTHON 3.11+', '/images/tech/python.svg', 1, true),
('pytorch', 'PYTORCH', '/images/tech/pytorch.svg', 2, true),
('fastapi', 'FASTAPI', '/images/tech/fastapi.svg', 3, true),
('sqlite', 'SQLITE WAL', '/images/tech/sqlite.svg', 4, true),
('cpp', 'C++', '/images/tech/cpp.svg', 5, true),
('docker', 'DOCKER', '/images/tech/docker.svg', 6, true),
('linux', 'LINUX', '/images/tech/linux.svg', 7, true),
('react', 'REACT 19', '/images/tech/react.svg', 8, true)
ON CONFLICT (tech_slug) DO NOTHING;

INSERT INTO public.lab_modules (module_code, module_status, subtitle, specs, toolchain, display_order, is_enabled) VALUES
('01 // THINK', '[SYS_MOD // 01 · ACTIVE]', 'AI · REASONING · TELEMETRY', ARRAY['Local-First AI & Neural Models', 'Cognitive Routing & Multi-LLM', 'Persistent Memory & SQLite WAL', 'Explainable ML & TreeSHAP', 'Telemetry Intelligence & SCADA', 'First-Principles Systems Thinking'], ARRAY['Python', 'FastAPI', 'PyTorch', 'Scikit-Learn', 'SQLite WAL', 'TreeSHAP', 'Ollama', 'Linux'], 1, true),
('02 // BUILD', '[SYS_MOD // 02 · ACTIVE]', 'SOFTWARE · INTERFACES · COMPUTING', ARRAY['Full-Stack Systems Architecture', 'Real-Time Collaboration Engines', 'Interactive 3D & WebGL/Three.js', 'High-Concurrency & REST APIs', 'Human-Computer Interaction (HCI)', 'Experimental Software & Tooling'], ARRAY['TypeScript', 'React 19', 'Next.js 16', 'Three.js', 'GSAP', 'C++', 'REST APIs', 'Docker'], 2, true)
ON CONFLICT (module_code) DO NOTHING;

INSERT INTO public.path_milestones (year, title, organization, description, context_chip, display_order, is_enabled) VALUES
('2021', 'TEACHING & EXPLORATION', 'bPITAMBAR · Conceptual Learning', 'Began deconstructing and teaching physics and conceptual science from first principles. Built deep foundational curiosity for how physical systems, forces, and mathematical abstractions operate in the real world.', 'FIRST PRINCIPLES', 1, true),
('2024', 'COMPUTER SCIENCE', 'VSSUT Burla · B.Tech CSE', 'Started formal Computer Science Engineering at Veer Surendra Sai University of Technology. Began translating mathematical models and physics intuition directly into code, algorithms, and software architectures.', 'FOUNDATION', 2, true),
('2026', 'BUILDING & EXPERIMENTING', 'Active Systems Builder · Ongoing Exploration', 'Architecting real systems: building local-first AI runtimes (RAJ OS), water telemetry intelligence (AquaNeon), collaborative platforms (Samvad), and exploratory embedded experiments in the lab.', 'CURRENT FOCUS', 3, true)
ON CONFLICT (year) DO NOTHING;

INSERT INTO public.social_links (platform_slug, label, handle, action_text, url, display_order, is_enabled) VALUES
('github', 'GITHUB', '@rajwav', 'VIEW PROFILE ↗', 'https://github.com/rajwav', 1, true),
('linkedin', 'LINKEDIN', 'PITAMBAR PANDA', 'CONNECT ↗', 'https://www.linkedin.com/in/pitambar-panda-0001braj/', 2, true),
('youtube', 'YOUTUBE', 'TRW — RAJ', 'WATCH ↗', 'https://www.youtube.com/@trw-raj', 3, true),
('instagram', 'INSTAGRAM', '@pitambar_28', 'VIEW ↗', 'https://www.instagram.com/pitambar_28/', 4, true)
ON CONFLICT (platform_slug) DO NOTHING;

-- Seed Initial Release v1 directly into portfolio_releases without requiring auth bypass
INSERT INTO public.portfolio_releases (payload, published_by, is_current, published_at)
SELECT 
  jsonb_build_object(
    'site_config', (SELECT row_to_json(sc) FROM (SELECT * FROM public.site_config WHERE id = 1) sc),
    'projects', (SELECT jsonb_agg(row_to_json(p)) FROM (SELECT * FROM public.projects WHERE is_enabled = true ORDER BY display_order ASC) p),
    'tech_stack', (SELECT jsonb_agg(row_to_json(ts)) FROM (SELECT * FROM public.tech_stack WHERE is_enabled = true ORDER BY display_order ASC) ts),
    'lab_modules', (SELECT jsonb_agg(row_to_json(lm)) FROM (SELECT * FROM public.lab_modules WHERE is_enabled = true ORDER BY display_order ASC) lm),
    'path_milestones', (SELECT jsonb_agg(row_to_json(pm)) FROM (SELECT * FROM public.path_milestones WHERE is_enabled = true ORDER BY display_order ASC) pm),
    'social_links', (SELECT jsonb_agg(row_to_json(sl)) FROM (SELECT * FROM public.social_links WHERE is_enabled = true ORDER BY display_order ASC) sl),
    'published_at', NOW()
  ),
  NULL,
  true,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_releases WHERE is_current = true);

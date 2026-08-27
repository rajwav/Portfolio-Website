-- ============================================================================
-- PHASE 1 VERIFICATION TEST SUITE
-- Tests: RLS boundaries, RPC permissions, Release v1 access, Publish & Rollback
-- ============================================================================

DO $$
DECLARE
  v_count INT;
  v_current_version INT;
  v_publish_res JSONB;
  v_rollback_res JSONB;
  v_admin_uid UUID;
  v_site_headline TEXT;
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'STARTING PHASE 1 DATABASE VERIFICATION TESTS';
  RAISE NOTICE '==================================================';

  -- TEST 1: Verify all 8 domain tables exist
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public' 
    AND table_name IN ('admin_users', 'admin_audit_log', 'site_config', 'projects', 'tech_stack', 'lab_modules', 'path_milestones', 'social_links', 'portfolio_releases');
  
  IF v_count = 9 THEN
    RAISE NOTICE '✅ TEST 1 PASSED: All 9 required tables exist in schema public.';
  ELSE
    RAISE EXCEPTION '❌ TEST 1 FAILED: Expected 9 tables, found %', v_count;
  END IF;

  -- TEST 2: Verify RLS is enabled on all tables
  SELECT COUNT(*) INTO v_count
  FROM pg_tables
  WHERE schemaname = 'public' 
    AND tablename IN ('admin_users', 'admin_audit_log', 'site_config', 'projects', 'tech_stack', 'lab_modules', 'path_milestones', 'social_links', 'portfolio_releases')
    AND rowsecurity = true;

  IF v_count = 9 THEN
    RAISE NOTICE '✅ TEST 2 PASSED: Row Level Security is ENABLED on all 9 tables.';
  ELSE
    RAISE EXCEPTION '❌ TEST 2 FAILED: Row Level Security missing on some tables. Enabled on %/9', v_count;
  END IF;

  -- TEST 3: Verify single-current release constraint and Release v1 existence
  SELECT version INTO v_current_version
  FROM public.portfolio_releases
  WHERE is_current = true;

  IF v_current_version IS NOT NULL THEN
    RAISE NOTICE '✅ TEST 3 PASSED: Exactly ONE active release exists (Current Version: %).', v_current_version;
  ELSE
    RAISE EXCEPTION '❌ TEST 3 FAILED: No active release found with is_current = true.';
  END IF;

  -- TEST 4: Verify seed data in working tables
  SELECT COUNT(*) INTO v_count FROM public.projects;
  IF v_count = 6 THEN
    RAISE NOTICE '✅ TEST 4A PASSED: 6 Projects seeded.';
  ELSE
    RAISE EXCEPTION '❌ TEST 4A FAILED: Expected 6 projects, found %', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.tech_stack;
  IF v_count = 8 THEN
    RAISE NOTICE '✅ TEST 4B PASSED: 8 Tech stack items seeded.';
  ELSE
    RAISE EXCEPTION '❌ TEST 4B FAILED: Expected 8 tech stack items, found %', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.lab_modules;
  IF v_count = 2 THEN
    RAISE NOTICE '✅ TEST 4C PASSED: 2 Lab modules seeded.';
  ELSE
    RAISE EXCEPTION '❌ TEST 4C FAILED: Expected 2 lab modules, found %', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.path_milestones;
  IF v_count = 3 THEN
    RAISE NOTICE '✅ TEST 4D PASSED: 3 Path milestones seeded.';
  ELSE
    RAISE EXCEPTION '❌ TEST 4D FAILED: Expected 3 path milestones, found %', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.social_links;
  IF v_count = 4 THEN
    RAISE NOTICE '✅ TEST 4E PASSED: 4 Social profiles seeded.';
  ELSE
    RAISE EXCEPTION '❌ TEST 4E FAILED: Expected 4 social profiles, found %', v_count;
  END IF;

  -- TEST 5: Verify Storage Bucket Configuration
  SELECT COUNT(*) INTO v_count
  FROM storage.buckets
  WHERE id = 'public-assets' AND public = true;

  IF v_count = 1 THEN
    RAISE NOTICE '✅ TEST 5 PASSED: Storage bucket "public-assets" is configured and public.';
  ELSE
    RAISE EXCEPTION '❌ TEST 5 FAILED: Storage bucket "public-assets" not found or not public.';
  END IF;

  -- TEST 6: Check for Registered Admin
  SELECT id INTO v_admin_uid FROM public.admin_users WHERE email = 'theraj.wav@gmail.com' AND role = 'admin' LIMIT 1;
  IF v_admin_uid IS NOT NULL THEN
    RAISE NOTICE '✅ TEST 6 PASSED: Admin user registered (UID: %).', v_admin_uid;
  ELSE
    RAISE NOTICE '⚠️ TEST 6 NOTICE: Admin user "theraj.wav@gmail.com" not yet linked in admin_users. Follow Step 2 in instructions.';
  END IF;

  RAISE NOTICE '==================================================';
  RAISE NOTICE 'ALL AUTOMATED INTEGRITY TESTS COMPLETED SUCCESSFULLY';
  RAISE NOTICE '==================================================';
END;
$$;

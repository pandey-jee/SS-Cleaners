-- ============================================
-- DATABASE VERIFICATION SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to check database state
-- and identify issues

-- ============================================
-- 1. CHECK ADMIN USER
-- ============================================
-- Check if admin user exists in auth.users
SELECT 
  'Admin user in auth.users' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL - Create user in Authentication > Users'
  END as status,
  COUNT(*) as count
FROM auth.users
WHERE email = 'pandeyji252002@gmail.com';

-- Check if admin user has admin role
SELECT 
  'Admin user has admin role' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL - Run migration to insert admin role'
  END as status,
  COUNT(*) as count
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'pandeyji252002@gmail.com'
AND ur.role = 'admin';

-- ============================================
-- 2. CHECK has_role FUNCTION
-- ============================================
-- Check if has_role function exists and signature
SELECT 
  'has_role function exists' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL - Function missing'
  END as status,
  STRING_AGG(pg_get_functiondef(p.oid)::text, E'\n---\n') as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'has_role';

-- ============================================
-- 3. CHECK TABLE EXISTENCE
-- ============================================
SELECT 
  'Required tables exist' as check_name,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS'
    ELSE '❌ FAIL - Missing tables: ' || (7 - COUNT(*))::text
  END as status,
  STRING_AGG(tablename, ', ') as found_tables
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_roles',
  'enquiries',
  'enquiry_tokens',
  'bookings',
  'conversations',
  'messages',
  'payment_orders'
);

-- ============================================
-- 4. CHECK RLS ENABLED
-- ============================================
SELECT 
  tablename,
  CASE 
    WHEN relrowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public'
AND tablename IN (
  'user_roles',
  'enquiries',
  'enquiry_tokens',
  'bookings',
  'conversations',
  'messages',
  'payment_orders'
)
ORDER BY tablename;

-- ============================================
-- 5. CHECK RLS POLICIES
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'a' THEN 'INSERT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = 'd' THEN 'DELETE'
    WHEN cmd = '*' THEN 'ALL'
  END as command,
  CASE 
    WHEN roles::text LIKE '%anon%' THEN '👤 anon'
    WHEN roles::text LIKE '%authenticated%' THEN '🔐 authenticated'
    WHEN roles::text LIKE '%service_role%' THEN '⚙️ service_role'
    ELSE roles::text
  END as applies_to
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'user_roles',
  'enquiries',
  'enquiry_tokens',
  'bookings',
  'conversations',
  'messages',
  'payment_orders'
)
ORDER BY tablename, policyname;

-- ============================================
-- 6. CHECK PERMISSIONS ON TABLES
-- ============================================
-- Check anon permissions
SELECT 
  'anon role permissions' as check_name,
  tablename,
  STRING_AGG(privilege_type, ', ') as permissions
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND table_schema = 'public'
AND table_name IN (
  'enquiries',
  'enquiry_tokens',
  'bookings'
)
GROUP BY tablename;

-- Check authenticated permissions
SELECT 
  'authenticated role permissions' as check_name,
  tablename,
  STRING_AGG(privilege_type, ', ') as permissions
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
AND table_schema = 'public'
GROUP BY tablename
HAVING tablename IN (
  'user_roles',
  'enquiries',
  'enquiry_tokens',
  'bookings',
  'conversations',
  'messages',
  'payment_orders'
);

-- ============================================
-- 7. CHECK DATA COUNTS
-- ============================================
SELECT 
  'enquiries' as table_name,
  COUNT(*) as row_count
FROM public.enquiries
UNION ALL
SELECT 
  'enquiry_tokens' as table_name,
  COUNT(*) as row_count
FROM public.enquiry_tokens
UNION ALL
SELECT 
  'bookings' as table_name,
  COUNT(*) as row_count
FROM public.bookings
UNION ALL
SELECT 
  'conversations' as table_name,
  COUNT(*) as row_count
FROM public.conversations
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as row_count
FROM public.messages
UNION ALL
SELECT 
  'user_roles' as table_name,
  COUNT(*) as row_count
FROM public.user_roles
ORDER BY table_name;

-- ============================================
-- 8. TEST has_role FUNCTION
-- ============================================
-- Test if has_role works for admin user
SELECT 
  'has_role function test' as check_name,
  CASE 
    WHEN public.has_role(u.id, 'admin') THEN '✅ PASS - Function works'
    ELSE '❌ FAIL - Function returns false'
  END as status,
  u.email
FROM auth.users u
WHERE email = 'pandeyji252002@gmail.com';

-- ============================================
-- 9. CHECK INDEXES
-- ============================================
SELECT 
  'Database indexes' as check_name,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'user_roles',
  'enquiries',
  'enquiry_tokens',
  'bookings',
  'conversations',
  'messages'
)
ORDER BY tablename, indexname;

-- ============================================
-- 10. SUMMARY
-- ============================================
SELECT 
  '========== SUMMARY ==========' as title,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'pandeyji252002@gmail.com') as admin_user_exists,
  (SELECT COUNT(*) FROM public.user_roles ur JOIN auth.users u ON ur.user_id = u.id WHERE u.email = 'pandeyji252002@gmail.com') as admin_role_assigned,
  (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'has_role') as has_role_function_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings') as bookings_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'enquiries') as enquiries_policies,
  (SELECT COUNT(*) FROM public.enquiries) as total_enquiries,
  (SELECT COUNT(*) FROM public.bookings) as total_bookings;

-- ============================================
-- INTERPRETATION GUIDE
-- ============================================
-- ✅ PASS - Check passed, no action needed
-- ❌ FAIL - Check failed, action required
-- 
-- If admin_user_exists = 0:
--   1. Go to Authentication > Users in Supabase Dashboard
--   2. Create user: pandeyji252002@gmail.com
--   3. Re-run migration
--
-- If admin_role_assigned = 0:
--   Run: INSERT INTO public.user_roles (user_id, role)
--        SELECT id, 'admin' FROM auth.users 
--        WHERE email = 'pandeyji252002@gmail.com'
--        ON CONFLICT DO NOTHING;
--
-- If has_role_function_exists = 0:
--   Run the complete migration: 20251204000000_fix_admin_system.sql
--
-- If bookings_policies or enquiries_policies = 0:
--   Run the complete migration: 20251204000000_fix_admin_system.sql

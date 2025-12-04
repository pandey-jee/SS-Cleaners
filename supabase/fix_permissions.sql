-- Quick fix for permission issues
-- Run this in Supabase SQL Editor if you're getting 403 errors

-- 1. Grant SELECT on auth.users to authenticated role (for foreign key joins)
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT SELECT ON auth.users TO authenticated, anon;

-- 2. Ensure all necessary table grants are in place
GRANT SELECT, INSERT ON public.enquiries TO anon;
GRANT SELECT ON public.enquiry_tokens TO anon;
GRANT SELECT, INSERT ON public.bookings TO anon;

GRANT ALL ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiry_tokens TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.payment_orders TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;

-- 3. Grant to service_role (for edge functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- 4. Verify admin user exists and has proper role
SELECT 
  u.email,
  ur.role,
  'Admin user is properly configured ✓' as status
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'pandeyji252002@gmail.com';

-- 5. Verify has_role function exists
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'has_role'
AND pronamespace = 'public'::regnamespace;

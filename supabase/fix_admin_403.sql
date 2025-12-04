-- ============================================
-- COMPREHENSIVE FIX FOR ADMIN ACCESS ISSUES
-- ============================================
-- Run this AFTER the main migration if you're getting 403 errors

-- 1. Grant auth schema access
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT SELECT ON auth.users TO authenticated, anon;

-- 2. Verify and test has_role function
DO $$
DECLARE
  admin_user_id UUID;
  role_check BOOLEAN;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'pandeyji252002@gmail.com';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found! Create user pandeyji252002@gmail.com first.';
  END IF;
  
  -- Test has_role function
  SELECT public.has_role(admin_user_id, 'admin') INTO role_check;
  
  IF NOT role_check THEN
    RAISE EXCEPTION 'has_role function returned false for admin user!';
  END IF;
  
  RAISE NOTICE 'Admin user verified: % (ID: %)', 'pandeyji252002@gmail.com', admin_user_id;
  RAISE NOTICE 'has_role function test: PASSED ✓';
END $$;

-- 3. Add additional admin policies with direct email check as fallback
-- This ensures admin always has access even if has_role fails

-- Bookings: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can read bookings" ON public.bookings;
CREATE POLICY "Admin by email can read bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

DROP POLICY IF EXISTS "Admin by email can manage bookings" ON public.bookings;
CREATE POLICY "Admin by email can manage bookings"
ON public.bookings FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Enquiries: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage enquiries" ON public.enquiries;
CREATE POLICY "Admin by email can manage enquiries"
ON public.enquiries FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Enquiry tokens: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage tokens" ON public.enquiry_tokens;
CREATE POLICY "Admin by email can manage tokens"
ON public.enquiry_tokens FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Conversations: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage conversations" ON public.conversations;
CREATE POLICY "Admin by email can manage conversations"
ON public.conversations FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Messages: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage messages" ON public.messages;
CREATE POLICY "Admin by email can manage messages"
ON public.messages FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Payment orders: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage payment orders" ON public.payment_orders;
CREATE POLICY "Admin by email can manage payment orders"
ON public.payment_orders FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Services: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage services" ON public.services;
CREATE POLICY "Admin by email can manage services"
ON public.services FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Pricing matrix: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage pricing" ON public.pricing_matrix;
CREATE POLICY "Admin by email can manage pricing"
ON public.pricing_matrix FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Leads: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage leads" ON public.leads;
CREATE POLICY "Admin by email can manage leads"
ON public.leads FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- Gallery: Add direct email check policy
DROP POLICY IF EXISTS "Admin by email can manage gallery" ON public.gallery;
CREATE POLICY "Admin by email can manage gallery"
ON public.gallery FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pandeyji252002@gmail.com'
);

-- 4. Grant all necessary permissions
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiry_tokens TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.payment_orders TO authenticated;
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.pricing_matrix TO authenticated;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.gallery TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;

-- 5. Final verification
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIX COMPLETE!';
  RAISE NOTICE 'Email-based admin policies created.';
  RAISE NOTICE 'Now logout, clear cache, and login again.';
  RAISE NOTICE '============================================';
END $$;

SELECT 
  'Database Configuration Complete ✓' as status,
  COUNT(*) as admin_users,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%Admin by email%') as email_based_policies
FROM public.user_roles
WHERE role = 'admin';

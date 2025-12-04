-- ============================================
-- FINAL FIX: Complete RLS Reset for All Tables
-- Run this ONCE in Supabase SQL Editor to fix all permission issues
-- ============================================

-- 1. ENQUIRIES TABLE - Allow public submissions
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_insert_enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "allow_select_enquiries_admin" ON public.enquiries;
DROP POLICY IF EXISTS "allow_update_enquiries_admin" ON public.enquiries;
DROP POLICY IF EXISTS "Anyone can create enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can view all enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_enquiries"
ON public.enquiries FOR INSERT
TO public WITH CHECK (true);

CREATE POLICY "admin_select_enquiries"
ON public.enquiries FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

CREATE POLICY "admin_update_enquiries"
ON public.enquiries FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

-- 2. CONVERSATIONS TABLE - Allow public access for chat
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public can insert conversations" ON public.conversations;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_conversations"
ON public.conversations FOR ALL
TO public
USING (true) WITH CHECK (true);

-- 3. MESSAGES TABLE - Allow public access for chat
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_messages"
ON public.messages FOR ALL
TO public
USING (true) WITH CHECK (true);

-- 4. BOOKINGS TABLE - Allow public submissions via token
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_bookings"
ON public.bookings FOR INSERT
TO public WITH CHECK (true);

CREATE POLICY "admin_select_bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

CREATE POLICY "admin_update_bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

-- 5. ENQUIRY_TOKENS TABLE - Allow public read for validation
ALTER TABLE public.enquiry_tokens DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Admins can create tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Admins can update tokens" ON public.enquiry_tokens;

ALTER TABLE public.enquiry_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_tokens"
ON public.enquiry_tokens FOR SELECT
TO public USING (true);

CREATE POLICY "admin_insert_tokens"
ON public.enquiry_tokens FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

CREATE POLICY "admin_update_tokens"
ON public.enquiry_tokens FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

-- 6. EMAIL_NOTIFICATIONS TABLE - Admin only
ALTER TABLE public.email_notifications DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email notifications" ON public.email_notifications;

ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_notifications"
ON public.email_notifications FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role::text = 'admin'
));

-- Allow service role to insert notifications (for edge functions)
CREATE POLICY "service_insert_notifications"
ON public.email_notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('enquiries', 'conversations', 'messages', 'bookings', 'enquiry_tokens', 'email_notifications')
ORDER BY tablename, policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies successfully reset for all booking system tables!';
  RAISE NOTICE '📝 Contact form submissions: ENABLED';
  RAISE NOTICE '💬 Real-time chat: ENABLED';
  RAISE NOTICE '🔗 Magic link tokens: ENABLED';
  RAISE NOTICE '📊 Admin access: PROTECTED';
END $$;

-- ============================================
-- FIX ADMIN SYSTEM COMPREHENSIVELY
-- ============================================
-- This migration fixes all admin-related issues:
-- 1. Ensures admin user exists in user_roles
-- 2. Fixes has_role function to handle both ENUM and TEXT
-- 3. Updates all RLS policies to work correctly
-- 4. Grants necessary permissions to anon role for booking system

-- ============================================
-- 1. INSERT ADMIN USER INTO user_roles
-- ============================================
-- Insert admin role for pandeyji252002@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'pandeyji252002@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ============================================
-- 1B. ADD MISSING COLUMNS IF NEEDED
-- ============================================
-- Add user_id to bookings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
  END IF;
END $$;

-- Add user_id to payment_orders if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_orders' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.payment_orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
  END IF;
END $$;

-- ============================================
-- 2. FIX has_role FUNCTION
-- ============================================
-- Drop all versions of has_role with CASCADE to handle dependent policies
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT) CASCADE;

-- Create unified has_role function that works with TEXT
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role::text
  )
$$;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, anon, service_role;

-- ============================================
-- 2B. RECREATE POLICIES FOR OTHER TABLES
-- ============================================
-- These policies were dropped by CASCADE, need to recreate them

-- Services table policies
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pricing matrix policies
DROP POLICY IF EXISTS "Anyone can view pricing" ON public.pricing_matrix;
CREATE POLICY "Anyone can view pricing"
ON public.pricing_matrix FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage pricing" ON public.pricing_matrix;
CREATE POLICY "Admins can manage pricing"
ON public.pricing_matrix FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leads table policies
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;
CREATE POLICY "Public can create leads"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
CREATE POLICY "Admins can manage leads"
ON public.leads FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Chat conversations policies
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role can manage conversations" ON public.chat_conversations;
CREATE POLICY "Service role can manage conversations"
ON public.chat_conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Chat messages policies
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role can manage messages" ON public.chat_messages;
CREATE POLICY "Service role can manage messages"
ON public.chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Gallery policies
DROP POLICY IF EXISTS "Anyone can view gallery" ON public.gallery;
CREATE POLICY "Anyone can view gallery"
ON public.gallery FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery"
ON public.gallery FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage policies for service-images bucket
DROP POLICY IF EXISTS "Anyone can view service images" ON storage.objects;
CREATE POLICY "Anyone can view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

DROP POLICY IF EXISTS "Admins can upload service images" ON storage.objects;
CREATE POLICY "Admins can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update service images" ON storage.objects;
CREATE POLICY "Admins can update service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete service images" ON storage.objects;
CREATE POLICY "Admins can delete service images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for gallery-images bucket
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
CREATE POLICY "Admins can update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. FIX ENQUIRIES POLICIES
-- ============================================
-- Drop all existing policies (including variations)
DROP POLICY IF EXISTS "Anyone can create enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Anyone can read enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can view all enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Users can view their own enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can insert enquiries" ON public.enquiries;

-- Public (anon + authenticated) can insert enquiries
CREATE POLICY "Public can insert enquiries"
ON public.enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can read enquiries (needed for booking completion page)
CREATE POLICY "Anyone can read enquiries"
ON public.enquiries FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can update enquiries
CREATE POLICY "Admins can update enquiries"
ON public.enquiries FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete enquiries
CREATE POLICY "Admins can delete enquiries"
ON public.enquiries FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 4. FIX ENQUIRY_TOKENS POLICIES
-- ============================================
-- Drop all existing policies (including variations of names)
DROP POLICY IF EXISTS "Anyone can read tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Users can read their own token" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Service role can read tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Service role can manage tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Admins can create tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Admins can insert tokens" ON public.enquiry_tokens;
DROP POLICY IF EXISTS "Admins can update tokens" ON public.enquiry_tokens;

-- Anyone can read tokens (needed for validation)
CREATE POLICY "Anyone can read tokens"
ON public.enquiry_tokens FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can insert tokens
CREATE POLICY "Admins can insert tokens"
ON public.enquiry_tokens FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update tokens
CREATE POLICY "Admins can update tokens"
ON public.enquiry_tokens FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage tokens
CREATE POLICY "Service role can manage tokens"
ON public.enquiry_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. FIX BOOKINGS POLICIES
-- ============================================
-- Drop all existing policies (including variations)
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Service role can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all to insert bookings" ON public.bookings;

-- Public (anon + authenticated) can insert bookings
CREATE POLICY "Public can insert bookings"
ON public.bookings FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can read all bookings
CREATE POLICY "Admins can read bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Admins can update bookings
CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can manage bookings
CREATE POLICY "Service role can manage bookings"
ON public.bookings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. FIX CONVERSATIONS POLICIES
-- ============================================
-- Drop all existing policies (including variations)
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Admins can view all conversations
CREATE POLICY "Admins can view conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update conversations
CREATE POLICY "Admins can update conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage conversations
CREATE POLICY "Service role can manage conversations"
ON public.conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. FIX MESSAGES POLICIES
-- ============================================
-- Drop all existing policies (including variations)
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can create messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;
DROP POLICY IF EXISTS "Service role can manage messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

-- Admins can view all messages
CREATE POLICY "Admins can view messages"
ON public.messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert messages
CREATE POLICY "Admins can insert messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update messages
CREATE POLICY "Admins can update messages"
ON public.messages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage messages
CREATE POLICY "Service role can manage messages"
ON public.messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 8. FIX PAYMENT_ORDERS POLICIES
-- ============================================
-- Drop all existing policies (including variations)
DROP POLICY IF EXISTS "Admins can view all payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Admins can view payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Admins can update payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Users can view own payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Users can insert payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Service role can manage payment orders" ON public.payment_orders;

-- Admins can view all payment orders
CREATE POLICY "Admins can view payment orders"
ON public.payment_orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own payment orders
CREATE POLICY "Users can view own payment orders"
ON public.payment_orders FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Users can insert their own payment orders
CREATE POLICY "Users can insert payment orders"
ON public.payment_orders FOR INSERT
TO authenticated
WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

-- Admins can update payment orders
CREATE POLICY "Admins can update payment orders"
ON public.payment_orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage payment orders
CREATE POLICY "Service role can manage payment orders"
ON public.payment_orders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 9. GRANT TABLE PERMISSIONS
-- ============================================
-- Grant necessary permissions to anon role for booking flow
GRANT SELECT ON public.enquiries TO anon;
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT ON public.enquiry_tokens TO anon;
GRANT SELECT, INSERT ON public.bookings TO anon;

-- Grant to authenticated
GRANT ALL ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiry_tokens TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.payment_orders TO authenticated;

-- Grant to service_role
GRANT ALL ON public.enquiries TO service_role;
GRANT ALL ON public.enquiry_tokens TO service_role;
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.payment_orders TO service_role;

-- ============================================
-- 10. CREATE INDEXES IF NOT EXISTS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
-- Note: idx_bookings_user_id and idx_payment_orders_user_id created in section 1B

-- ============================================
-- 11. COMMENTS
-- ============================================
COMMENT ON FUNCTION public.has_role(UUID, TEXT) IS 'Check if user has specified role - works with TEXT type';
COMMENT ON TABLE public.user_roles IS 'User role assignments - admin email: pandeyji252002@gmail.com';

-- ============================================
-- VERIFY ADMIN USER
-- ============================================
-- Check if admin was created successfully
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  RAISE NOTICE 'Admin users found: %', admin_count;
END $$;

-- ============================================
-- SECURITY FIXES MIGRATION
-- ============================================
-- This migration addresses critical security vulnerabilities:
-- 1. Implements proper admin role system
-- 2. Fixes overly permissive RLS policies
-- 3. Restricts access to authenticated users only

-- ============================================
-- 1. CREATE USER ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Service role can manage all roles
CREATE POLICY "Service role can manage roles"
ON public.user_roles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. UPDATE has_role FUNCTION
-- ============================================
-- Drop old function if exists
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT);

-- Create new function that uses user_roles table
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role = $2
  );
END;
$$;

-- ============================================
-- 3. FIX ENQUIRY_TOKENS POLICIES
-- ============================================
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can read tokens" ON public.enquiry_tokens;

-- Allow reading only specific token (by token value)
CREATE POLICY "Users can read their own token"
ON public.enquiry_tokens FOR SELECT
USING (
  -- Service role can read all
  auth.jwt() ->> 'role' = 'service_role'
  OR
  -- Authenticated admins can read all
  (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'))
);

-- Allow service role to validate tokens
CREATE POLICY "Service role can read tokens"
ON public.enquiry_tokens FOR SELECT
TO service_role
USING (true);

-- ============================================
-- 4. FIX CONVERSATIONS POLICIES
-- ============================================
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can manage conversations
CREATE POLICY "Service role can manage conversations"
ON public.conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. FIX MESSAGES POLICIES
-- ============================================
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can create messages
CREATE POLICY "Admins can create messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage messages
CREATE POLICY "Service role can manage messages"
ON public.messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. FIX PAYMENT_ORDERS POLICIES
-- ============================================
-- Drop insecure admin policy
DROP POLICY IF EXISTS "Admins can view all payment orders" ON public.payment_orders;

-- Create proper admin policy using role table
CREATE POLICY "Admins can view all payment orders"
ON public.payment_orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update payment orders
CREATE POLICY "Admins can update payment orders"
ON public.payment_orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 7. ADD SERVICE ROLE POLICIES FOR BOOKINGS
-- ============================================
-- Service role needs to update bookings for payment
CREATE POLICY "Service role can manage bookings"
ON public.bookings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 8. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ============================================
-- 10. INSERT DEFAULT ADMIN (Update email)
-- ============================================
-- NOTE: Update this email with your actual admin email after deployment
-- Run this after creating your admin account:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'your-admin-email@sspurecare.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.user_roles IS 'Proper role-based access control for users';
COMMENT ON FUNCTION public.has_role IS 'Checks if a user has a specific role using user_roles table';
COMMENT ON POLICY "Admins can view all payment orders" ON public.payment_orders IS 'Updated to use user_roles table instead of email pattern';

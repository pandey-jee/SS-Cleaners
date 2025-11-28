-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create services table for managing services dynamically
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2),
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can view active services
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

-- Only admins can manage services
CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create pricing_matrix table
CREATE TABLE public.pricing_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL, -- 'house', 'office', etc.
  size_category TEXT NOT NULL, -- '1BHK', '2BHK', 'small_office', etc.
  base_price DECIMAL(10,2) NOT NULL,
  add_ons JSONB DEFAULT '{}'::jsonb, -- {"fridge_cleaning": 500, "oven_cleaning": 300}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pricing_matrix ENABLE ROW LEVEL SECURITY;

-- Anyone can view pricing
CREATE POLICY "Anyone can view pricing"
ON public.pricing_matrix
FOR SELECT
USING (true);

-- Only admins can manage pricing
CREATE POLICY "Admins can manage pricing"
ON public.pricing_matrix
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update leads table RLS policies - make them admin-only
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public read on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public update on leads" ON public.leads;

-- Only admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage leads
CREATE POLICY "Admins can manage leads"
ON public.leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can insert leads (for contact forms/chatbot)
CREATE POLICY "Public can create leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Update chat tables RLS - restrict to admins only
DROP POLICY IF EXISTS "Allow all operations on chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Allow all operations on chat_messages" ON public.chat_messages;

-- Only admins can view conversations
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert (for chatbot edge function)
CREATE POLICY "Service role can manage conversations"
ON public.chat_conversations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage messages"
ON public.chat_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add trigger for services updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_matrix_updated_at
BEFORE UPDATE ON public.pricing_matrix
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial services
INSERT INTO public.services (name, slug, description, short_description, base_price, price_range_min, price_range_max, features, display_order) VALUES
('House Deep Cleaning', 'house-cleaning', 'Professional deep cleaning service for your home', 'Complete home sanitization', 1999, 1999, 4499, '["Deep cleaning of all rooms", "Kitchen & bathroom sanitization", "Dusting & vacuuming", "Window cleaning"]'::jsonb, 1),
('Office Cleaning', 'office-cleaning', 'Commercial office cleaning and maintenance', 'Professional office sanitization', 2999, 2999, 9999, '["Desk & workstation cleaning", "Common area sanitization", "Restroom cleaning", "Trash removal"]'::jsonb, 2),
('Water Tank Cleaning', 'water-tank', 'Complete water tank cleaning and disinfection', 'Safe drinking water', 999, 999, 2499, '["Tank draining & scrubbing", "Disinfection", "Quality testing", "Certificate provided"]'::jsonb, 3);
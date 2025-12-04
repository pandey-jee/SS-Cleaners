-- Two-step booking system with enquiries, magic links, and bookings
-- This migration creates the complete schema for the new approach

-- ============================================
-- 1. ENQUIRIES TABLE
-- ============================================
-- Simple enquiry form (step 1) - replaces direct booking
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  service_required TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'link_sent', 'booking_created', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 2. ENQUIRY TOKENS TABLE
-- ============================================
-- Magic links for secure access to detailed booking form
CREATE TABLE IF NOT EXISTS public.enquiry_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 3. BOOKINGS TABLE
-- ============================================
-- Complete booking details (step 2) - created after token form submission
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  token_id UUID REFERENCES public.enquiry_tokens(id) ON DELETE SET NULL,
  
  -- Basic info (from enquiry, can be edited)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  service_type TEXT NOT NULL,
  
  -- Property details
  property_type TEXT, -- apartment, villa, office, house, etc.
  property_size TEXT, -- 1bhk, 2bhk, or sq_ft
  bedrooms INTEGER,
  bathrooms INTEGER,
  
  -- Add-ons
  add_ons JSONB DEFAULT '[]'::jsonb,
  
  -- Schedule
  preferred_date DATE,
  time_slot TEXT,
  
  -- Location details
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  area TEXT,
  landmark TEXT,
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Additional
  special_instructions TEXT,
  estimated_price DECIMAL(10, 2),
  
  -- Status management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 4. CONVERSATIONS TABLE
-- ============================================
-- One conversation per enquiry/booking for 1-to-1 chat
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_admin_count INTEGER DEFAULT 0,
  unread_user_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 5. MESSAGES TABLE
-- ============================================
-- Individual chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID, -- admin user id, null for user
  sender_name TEXT,
  message_text TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 6. EMAIL NOTIFICATIONS TABLE
-- ============================================
-- Track all emails sent
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'user')),
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'enquiry_received',
    'enquiry_replied', 
    'booking_link_sent',
    'booking_created',
    'booking_confirmed',
    'status_updated',
    'chat_message'
  )),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiry_tokens_token ON public.enquiry_tokens(token);
CREATE INDEX IF NOT EXISTS idx_enquiry_tokens_enquiry_id ON public.enquiry_tokens(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_bookings_enquiry_id ON public.bookings(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON public.bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_conversations_enquiry_id ON public.conversations(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notifications_enquiry_id ON public.email_notifications(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_booking_id ON public.email_notifications(booking_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Public can insert enquiries
CREATE POLICY "Anyone can create enquiries"
ON public.enquiries FOR INSERT
WITH CHECK (true);

-- Admins can view all enquiries
CREATE POLICY "Admins can view all enquiries"
ON public.enquiries FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update enquiries
CREATE POLICY "Admins can update enquiries"
ON public.enquiries FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can read tokens (for validation)
CREATE POLICY "Anyone can read tokens"
ON public.enquiry_tokens FOR SELECT
USING (true);

-- Admins can create tokens
CREATE POLICY "Admins can create tokens"
ON public.enquiry_tokens FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update tokens
CREATE POLICY "Admins can update tokens"
ON public.enquiry_tokens FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can insert bookings (via token)
CREATE POLICY "Anyone can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update bookings
CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Conversations and messages policies
CREATE POLICY "Anyone can view conversations"
ON public.conversations FOR SELECT
USING (true);

CREATE POLICY "Anyone can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.messages FOR SELECT
USING (true);

CREATE POLICY "Anyone can create messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Only admins can view email notifications
CREATE POLICY "Admins can view email notifications"
ON public.email_notifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIGGERS
-- ============================================
-- Auto-update updated_at timestamp
CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_booking_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token_string TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 32-character token
    token_string := encode(gen_random_bytes(24), 'base64');
    token_string := replace(token_string, '/', '_');
    token_string := replace(token_string, '+', '-');
    token_string := replace(token_string, '=', '');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM enquiry_tokens WHERE token = token_string) INTO token_exists;
    
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN token_string;
END;
$$;

-- Function to create conversation when enquiry is created
CREATE OR REPLACE FUNCTION create_conversation_for_enquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.conversations (enquiry_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_conversation_on_enquiry
  AFTER INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_enquiry();

-- Function to update unread message counts
CREATE OR REPLACE FUNCTION update_unread_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sender_type = 'user' THEN
    UPDATE public.conversations
    SET unread_admin_count = unread_admin_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  ELSE
    UPDATE public.conversations
    SET unread_user_count = unread_user_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_unread_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_counts();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_conversation_id UUID,
  p_reader_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark messages as read
  UPDATE public.messages
  SET read_at = now()
  WHERE conversation_id = p_conversation_id
    AND read_at IS NULL
    AND sender_type != p_reader_type;
  
  -- Reset unread count
  IF p_reader_type = 'admin' THEN
    UPDATE public.conversations
    SET unread_admin_count = 0
    WHERE id = p_conversation_id;
  ELSE
    UPDATE public.conversations
    SET unread_user_count = 0
    WHERE id = p_conversation_id;
  END IF;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.enquiries IS 'Simple enquiry form submissions (step 1 of booking)';
COMMENT ON TABLE public.enquiry_tokens IS 'Magic links for secure access to detailed booking form';
COMMENT ON TABLE public.bookings IS 'Complete booking details submitted via token link (step 2)';
COMMENT ON TABLE public.conversations IS 'One-to-one chat conversations between user and admin';
COMMENT ON TABLE public.messages IS 'Individual messages in conversations';
COMMENT ON TABLE public.email_notifications IS 'Track all email notifications sent';

COMMENT ON COLUMN public.enquiries.status IS 'new, replied, link_sent, booking_created, closed';
COMMENT ON COLUMN public.enquiry_tokens.token IS 'Secure random token for URL';
COMMENT ON COLUMN public.enquiry_tokens.expires_at IS 'Token expiry (e.g., 7 days from creation)';
COMMENT ON COLUMN public.bookings.status IS 'pending, confirmed, in_progress, completed, cancelled';

-- Add user_id to bookings table if not exists (for linking to authenticated users)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_bookings_user_id ON bookings(user_id);
  END IF;
END $$;

-- Ensure enquiries table has user_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enquiries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_enquiries_user_id ON enquiries(user_id);
  END IF;
END $$;

-- Update RLS policies for bookings to allow users to view their own bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Update RLS policies for enquiries to allow users to view their own enquiries
DROP POLICY IF EXISTS "Users can view their own enquiries" ON enquiries;
CREATE POLICY "Users can view their own enquiries"
  ON enquiries FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    public.has_role(auth.uid(), 'admin')
    OR
    user_id IS NULL -- Allow viewing enquiries submitted before auth was required
  );

-- Allow authenticated users to insert their own enquiries
DROP POLICY IF EXISTS "Authenticated users can insert enquiries" ON enquiries;
CREATE POLICY "Authenticated users can insert enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL -- Allow both authenticated and anonymous
  );

-- Update conversations RLS to allow users to view their own conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    enquiry_id IN (
      SELECT id FROM enquiries WHERE user_id = auth.uid()
    )
    OR
    public.has_role(auth.uid(), 'admin')
  );

-- Update messages RLS to allow users to view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE enquiry_id IN (
        SELECT id FROM enquiries WHERE user_id = auth.uid()
      )
    )
    OR
    public.has_role(auth.uid(), 'admin')
  );

-- Allow users to send messages in their own conversations
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE enquiry_id IN (
        SELECT id FROM enquiries WHERE user_id = auth.uid()
      )
    )
    OR
    sender_type = 'admin'
  );

-- Comments for documentation
COMMENT ON COLUMN bookings.user_id IS 'References the authenticated user who made the booking';
COMMENT ON COLUMN enquiries.user_id IS 'References the authenticated user who submitted the enquiry (NULL for anonymous)';

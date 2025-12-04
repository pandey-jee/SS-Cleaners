-- Enable Realtime for chat tables
-- This migration enables real-time subscriptions for instant messaging

-- Enable replica identity for realtime to track changes
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Add comments
COMMENT ON TABLE public.conversations IS 'Conversations table with realtime enabled for presence and status updates';
COMMENT ON TABLE public.messages IS 'Messages table with realtime enabled for instant chat delivery';

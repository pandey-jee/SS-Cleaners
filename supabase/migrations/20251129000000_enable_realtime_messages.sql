-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Enable realtime publication for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Ensure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Comment for documentation
COMMENT ON TABLE public.messages IS 'Messages table with realtime enabled for instant chat updates';

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  service_required: string;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  message_text: string;
  created_at: string;
}

interface UseAdminNotificationsProps {
  enabled?: boolean;
  onNewEnquiry?: (enquiry: Enquiry) => void;
  onNewMessage?: (message: Message) => void;
}

export function useAdminNotifications({ 
  enabled = true,
  onNewEnquiry,
  onNewMessage 
}: UseAdminNotificationsProps = {}) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create notification sound
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZTRE');
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('admin_notifications', {
        config: { broadcast: { self: false } }
      })
      // Listen for new enquiries
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enquiries',
        },
        (payload) => {
          const newEnquiry = payload.new as Enquiry;
          console.log('New enquiry received:', newEnquiry);

          // Play sound
          playNotificationSound();

          // Show toast notification
          toast.success('New Customer Enquiry! 🎉', {
            description: `${newEnquiry.name} is interested in ${newEnquiry.service_required}`,
            duration: 8000,
            action: {
              label: 'View Details',
              onClick: () => {
                window.location.href = `/admin/enquiries/${newEnquiry.id}`;
              },
            },
          });

          // Call callback if provided
          if (onNewEnquiry) {
            onNewEnquiry(newEnquiry);
          }
        }
      )
      // Listen for new messages from users
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.user', // Only user messages
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          console.log('New user message:', newMessage);

          // Get conversation and enquiry details
          const { data: conversation } = await supabase
            .from('conversations')
            .select('enquiry_id, enquiries(name, email)')
            .eq('id', newMessage.conversation_id)
            .single();

          if (conversation) {
            // Play sound
            playNotificationSound();

            const enquiry = conversation.enquiries as any;
            const senderName = enquiry?.name || newMessage.sender_name || 'Customer';

            // Show toast notification
            toast.info('New Message Received 💬', {
              description: `${senderName}: ${newMessage.message_text.substring(0, 50)}${newMessage.message_text.length > 50 ? '...' : ''}`,
              duration: 8000,
              action: {
                label: 'Reply',
                onClick: () => {
                  window.location.href = `/admin/enquiries/${conversation.enquiry_id}`;
                },
              },
            });

            // Call callback if provided
            if (onNewMessage) {
              onNewMessage(newMessage);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Admin notifications subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('Unsubscribing from admin notifications');
      channel.unsubscribe();
    };
  }, [enabled, playNotificationSound, onNewEnquiry, onNewMessage]);

  return {
    playNotificationSound,
  };
}

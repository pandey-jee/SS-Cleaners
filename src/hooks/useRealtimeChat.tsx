import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  message_text: string;
  read_at: string | null;
  created_at: string;
}

interface UseRealtimeChatProps {
  conversationId: string | null;
  userType: 'user' | 'admin';
  onNewMessage?: (message: Message) => void;
}

export function useRealtimeChat({ conversationId, userType, onNewMessage }: UseRealtimeChatProps) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZTRE');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio creation failed:', err);
    }
  }, []);

  // Broadcast typing indicator
  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (channelRef.current && conversationId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userType, isTyping }
      });
    }
  }, [conversationId, userType]);

  // Handle typing with auto-stop
  const handleTyping = useCallback(() => {
    broadcastTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false);
    }, 1000);
  }, [broadcastTyping]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .eq('sender_type', userType === 'admin' ? 'user' : 'admin');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [userType]);

  // Setup realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const otherUserType = userType === 'admin' ? 'user' : 'admin';

    const channel = supabase
      .channel(`conversation_${conversationId}`, {
        config: { presence: { key: userType } }
      })
      // Listen for new messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('New message received:', newMessage);
          
          setMessages((prev) => [...prev, newMessage]);
          
          if (onNewMessage) {
            onNewMessage(newMessage);
          }

          // Play sound if message is from other user
          if (newMessage.sender_type === otherUserType) {
            playNotificationSound();
            
            // Auto-mark as read after a short delay
            setTimeout(() => {
              markAsRead([newMessage.id]);
            }, 1500);
          }
        }
      )
      // Listen for message updates (read receipts)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Message updated:', payload);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      // Listen for typing indicators
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userType === otherUserType) {
          setIsOtherUserTyping(payload.isTyping);
          
          if (payload.isTyping && typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          if (payload.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsOtherUserTyping(false);
            }, 3000);
          }
        }
      })
      // Listen for presence (online/offline)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherUserPresent = Object.values(state).some(
          (presences: any) => presences[0]?.userType === otherUserType
        );
        setIsOtherUserOnline(otherUserPresent);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (newPresences[0]?.userType === otherUserType) {
          setIsOtherUserOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (leftPresences[0]?.userType === otherUserType) {
          setIsOtherUserOnline(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            userType, 
            timestamp: new Date().toISOString() 
          });
        }
      });

    channelRef.current = channel;
    console.log('Realtime chat subscription active for:', conversationId);

    return () => {
      console.log('Unsubscribing from chat channel');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing before leaving
      broadcastTyping(false);
      channel.unsubscribe();
    };
  }, [conversationId, userType, onNewMessage, playNotificationSound, markAsRead, broadcastTyping]);

  return {
    isOtherUserTyping,
    isOtherUserOnline,
    handleTyping,
    broadcastTyping,
    markAsRead,
    messages,
    setMessages,
  };
}

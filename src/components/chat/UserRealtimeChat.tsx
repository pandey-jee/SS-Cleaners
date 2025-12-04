import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { cn } from "@/lib/utils";
import { sanitizeInput } from "@/lib/sanitize";
import { toast } from "sonner";

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  message_text: string;
  read_at: string | null;
  created_at: string;
}

interface UserRealtimeChatProps {
  enquiryId?: string;
  userEmail: string;
  userName: string;
}

const UserRealtimeChat = ({ enquiryId, userEmail, userName }: UserRealtimeChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use the realtime chat hook
  const {
    isOtherUserTyping,
    isOtherUserOnline,
    handleTyping,
    messages,
    setMessages,
  } = useRealtimeChat({
    conversationId,
    userType: 'user',
    onNewMessage: (message) => {
      // Scroll to bottom when new message arrives
      setTimeout(() => scrollToBottom(), 100);
    },
  });

  // Get or create conversation when chat opens
  useEffect(() => {
    if (isOpen && !conversationId && enquiryId) {
      initializeConversation();
    }
  }, [isOpen, enquiryId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const initializeConversation = async () => {
    try {
      // Check if conversation exists for this enquiry
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let conv = existingConv;

      // Create conversation if it doesn't exist
      if (!conv) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            enquiry_id: enquiryId,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        conv = newConv;
      }

      setConversationId(conv.id);

      // Load existing messages
      const { data: msgs, error: msgsError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (msgsError) throw msgsError;

      setMessages(msgs || []);

    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to load chat');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending || !conversationId) return;

    const messageText = sanitizeInput(input.trim());
    if (!messageText) return;
    
    setInput("");
    setIsSending(true);

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type: "user",
        sender_name: userName,
        message_text: messageText,
      });

      if (error) throw error;

      // Update conversation's last_message_at and increment unread count
      const { data: currentConv } = await supabase
        .from('conversations')
        .select('unread_admin_count')
        .eq('id', conversationId)
        .single();

      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          unread_admin_count: (currentConv?.unread_admin_count || 0) + 1
        })
        .eq('id', conversationId);

      // Message will appear via realtime subscription
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setInput(messageText); // Restore message
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping(); // Trigger typing indicator
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-large transition-all duration-300",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-primary hover:opacity-90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {/* Unread indicator */}
        {!isOpen && messages.some(m => m.sender_type === 'admin' && !m.read_at) && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            {messages.filter(m => m.sender_type === 'admin' && !m.read_at).length}
          </span>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] shadow-large border-border">
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-primary p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-foreground">SS PureCare Support</h3>
                  <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
                    <Circle 
                      className={cn(
                        "h-2 w-2 fill-current",
                        isOtherUserOnline ? "text-green-400" : "text-gray-400"
                      )} 
                    />
                    <span>{isOtherUserOnline ? 'Admin is online' : 'Admin is offline'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    <p className="mb-2">👋 Welcome to SS PureCare Support!</p>
                    <p>Send a message and our team will respond shortly.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender_type === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="flex flex-col max-w-[75%]">
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2",
                            msg.sender_type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {msg.sender_type === "admin" && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {msg.sender_name || 'Admin'}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message_text}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {isOtherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-1">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">Admin is typing</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              {conversationId ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isSending}
                      size="icon"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Real-time messaging • Instant replies
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground mt-2">Loading chat...</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default UserRealtimeChat;

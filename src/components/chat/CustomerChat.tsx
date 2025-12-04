import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Loader2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message_text: string;
  sender_type: string;
  sender_name: string | null;
  created_at: string;
}

interface CustomerChatProps {
  enquiryId?: string;
  bookingId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const CustomerChat = ({ enquiryId, bookingId, isOpen = false, onClose }: CustomerChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(isOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsChatOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && (enquiryId || bookingId) && isChatOpen) {
      const cleanup = initializeChat();
      return () => {
        if (cleanup) {
          cleanup.then(cleanupFn => {
            if (cleanupFn) cleanupFn();
          });
        }
      };
    }
  }, [isAuthenticated, enquiryId, bookingId, isChatOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const initializeChat = async () => {
    try {
      let targetEnquiryId = enquiryId;

      // If bookingId is provided, get the enquiry_id
      if (bookingId && !enquiryId) {
        const { data: booking } = await supabase
          .from("bookings")
          .select("enquiry_id")
          .eq("id", bookingId)
          .single();

        if (booking) {
          targetEnquiryId = booking.enquiry_id;
        }
      }

      if (!targetEnquiryId) return;

      // Get or create conversation
      let { data: conversation, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("enquiry_id", targetEnquiryId)
        .single();

      if (error || !conversation) {
        // Create conversation if it doesn't exist
        const { data: newConversation, error: createError } = await supabase
          .from("conversations")
          .insert({ enquiry_id: targetEnquiryId })
          .select("id")
          .single();

        if (createError) throw createError;
        conversation = newConversation;
      }

      setConversationId(conversation.id);

      // Fetch existing messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`customer-chat-${conversation.id}`, {
          config: {
            broadcast: { self: true },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversation.id}`,
          },
          (payload) => {
            console.log("Real-time message received:", payload);
            const newMessage = payload.new as Message;
            setMessages((prev) => {
              // Check if message already exists to prevent duplicates
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          message_text: messageText,
          sender_type: "user",
          sender_id: user?.id,
          sender_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
        })
        .select()
        .single();

      if (error) throw error;

      // Immediately add message to UI (real-time will handle duplicates)
      if (data) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some(msg => msg.id === data.id)) {
            return prev;
          }
          return [...prev, data as Message];
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setNewMessage(messageText); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (onClose && isChatOpen) {
      onClose();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isChatOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={toggleChat}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat with Support
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleChat}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    toggleChat();
                    onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start a conversation with our support team</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message_text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !newMessage.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerChat;

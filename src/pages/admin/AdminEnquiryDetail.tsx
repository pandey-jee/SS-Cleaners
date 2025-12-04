import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import {
  Loader2,
  ArrowLeft,
  Send,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  User,
  Briefcase,
  CheckCheck,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

type EnquiryStatus = "new" | "replied" | "link_sent" | "booking_created" | "closed";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  service_required: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: "user" | "admin";
  sender_id: string | null;
  sender_name: string | null;
  message_text: string;
  read_at: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  enquiry_id: string;
  booking_id: string | null;
  last_message_at: string | null;
  unread_admin_count: number;
  unread_user_count: number;
  created_at: string;
}

interface Token {
  id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

const statusColors: Record<EnquiryStatus, string> = {
  new: "bg-blue-500",
  replied: "bg-yellow-500",
  link_sent: "bg-purple-500",
  booking_created: "bg-green-500",
  closed: "bg-gray-500",
};

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  replied: "Replied",
  link_sent: "Link Sent",
  booking_created: "Booking Created",
  closed: "Closed",
};

const AdminEnquiryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [replyWithLink, setReplyWithLink] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      fetchEnquiryDetails();
      fetchConversationAndMessages();
      fetchTokens();
    }
  }, [id]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZTRE');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  // Separate useEffect for real-time subscription after conversation is loaded
  useEffect(() => {
    if (!conversation?.id) return;

    // Set up real-time channel with multiple features
    const channel = supabase
      .channel(`conversation_${conversation.id}`, {
        config: { presence: { key: 'admin' } }
      })
      // Listen for new messages
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log("New message received:", newMessage);
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
          
          // Play sound if message is from user
          if (newMessage.sender_type === 'user') {
            playNotificationSound();
          }
        }
      )
      // Listen for message updates (read receipts)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log("Message updated:", payload);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      // Listen for typing indicators
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userType === 'user') {
          setIsUserTyping(payload.isTyping);
          
          // Clear typing indicator after 3 seconds
          if (payload.isTyping && typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          if (payload.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsUserTyping(false);
            }, 3000);
          }
        }
      })
      // Listen for presence (online/offline)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userPresent = Object.values(state).some(
          (presences: any) => presences[0]?.userType === 'user'
        );
        setIsUserOnline(userPresent);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (newPresences[0]?.userType === 'user') {
          setIsUserOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (leftPresences[0]?.userType === 'user') {
          setIsUserOnline(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track admin presence
          await channel.track({ userType: 'admin', timestamp: new Date().toISOString() });
        }
      });

    channelRef.current = channel;
    console.log("Real-time subscription active for conversation:", conversation.id);

    return () => {
      console.log("Unsubscribing from conversation channel");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channel.unsubscribe();
    };
  }, [conversation?.id, playNotificationSound]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchEnquiryDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("enquiries" as any)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEnquiry(data as any);
    } catch (error: any) {
      console.error("Error fetching enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to load enquiry details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationAndMessages = async () => {
    try {
      // Fetch conversation
      const { data: convData, error: convError } = await supabase
        .from("conversations" as any)
        .select("*")
        .eq("enquiry_id", id)
        .single();

      if (convError) throw convError;
      setConversation(convData as any);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages" as any)
        .select("*")
        .eq("conversation_id", convData.id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((messagesData as any) || []);

      // Mark admin's unread messages as read
      if (convData.unread_admin_count > 0) {
        await supabase.rpc("mark_messages_read", {
          p_conversation_id: convData.id,
          p_reader_type: "admin",
        });
      }
    } catch (error: any) {
      console.error("Error fetching conversation:", error);
    }
  };

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from("enquiry_tokens" as any)
        .select("*")
        .eq("enquiry_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTokens((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching tokens:", error);
    }
  };

  // Broadcast typing indicator
  const handleTyping = useCallback(() => {
    if (channelRef.current && conversation?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userType: 'admin', isTyping: true }
      });

      // Stop typing after delay
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userType: 'admin', isTyping: false }
        });
      }, 1000);
    }
  }, [conversation?.id]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !conversation) return;

    setSendingMessage(true);
    try {
      // Stop typing indicator
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userType: 'admin', isTyping: false }
        });
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_type: "admin",
        sender_name: "Admin",
        message_text: messageContent.trim(),
      } as any);

      if (error) throw error;

      // Update enquiry status to 'replied' if it's new
      if (enquiry?.status === "new") {
        await supabase
          .from("enquiries" as any)
          .update({ status: "replied" })
          .eq("id", id);
        
        setEnquiry({ ...enquiry, status: "replied" });
      }

      setMessageContent("");
      
      // Refresh messages to ensure latest is displayed
      await fetchConversationAndMessages();

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the customer",
      });

      // Send email notification (don't await to avoid blocking UI)
      supabase.functions.invoke("send-chat-notification", {
        body: {
          conversationId: conversation.id,
          recipientEmail: enquiry?.email,
        },
      }).catch((error) => {
        console.error("Failed to send email notification:", error);
        // Don't show error to user, just log it
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendBookingLink = async () => {
    if (!enquiry) return;

    setSendingLink(true);
    try {
      // Generate token
      const { data: token, error: rpcError } = await supabase.rpc("generate_booking_token");
      
      if (rpcError) {
        console.error("Token generation error:", rpcError);
        throw new Error("Failed to generate booking token");
      }

      if (!token) {
        throw new Error("No token returned from generation");
      }

      console.log("Generated token:", token);
      
      // Insert token record
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data: insertedToken, error: tokenError } = await supabase
        .from("enquiry_tokens" as any)
        .insert({
          enquiry_id: id,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false,
        } as any)
        .select()
        .single();

      if (tokenError) {
        console.error("Token insert error:", tokenError);
        throw tokenError;
      }

      console.log("Token inserted successfully:", insertedToken);

      // Send booking link via message if checkbox is checked
      if (replyWithLink && conversation) {
        const bookingLink = `${window.location.origin}/booking/complete?token=${token}`;
        const linkMessage = messageContent.trim()
          ? `${messageContent.trim()}\n\nPlease use this secure link to complete your booking:\n${bookingLink}`
          : `Thank you for your enquiry! Please use this secure link to complete your detailed booking:\n${bookingLink}\n\nThis link will expire in 7 days.`;

        await supabase.from("messages" as any).insert({
          conversation_id: conversation.id,
          sender_type: "admin",
          sender_name: "Admin",
          message_text: linkMessage,
        } as any);

        setMessageContent("");
      }

      // Send email with booking link
      const { error: emailError } = await supabase.functions.invoke("send-booking-link", {
        body: {
          enquiryId: id,
          token: token,
          customerEmail: enquiry.email,
          customerName: enquiry.name,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't fail if email fails
      }

      // Update enquiry status
      await supabase
        .from("enquiries" as any)
        .update({ status: "link_sent" })
        .eq("id", id);

      setEnquiry({ ...enquiry, status: "link_sent" });
      
      await fetchTokens();

      toast({
        title: "Booking Link Sent!",
        description: `A secure booking link has been sent to ${enquiry.email}`,
      });
    } catch (error: any) {
      console.error("Error sending booking link:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send booking link",
        variant: "destructive",
      });
    } finally {
      setSendingLink(false);
    }
  };

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry) return;

    try {
      const { error } = await supabase
        .from("enquiries" as any)
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setEnquiry({ ...enquiry, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Enquiry status changed to ${statusLabels[newStatus]}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Enquiry not found</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/admin/enquiries")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Enquiries
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/enquiries")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Enquiries
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Enquiry #{enquiry.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-1">
              Submitted {formatDate(enquiry.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={enquiry.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="link_sent">Link Sent</SelectItem>
                <SelectItem value="booking_created">Booking Created</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Badge className={statusColors[enquiry.status]}>
              {statusLabels[enquiry.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Enquiry Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{enquiry.name}</p>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {enquiry.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {enquiry.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{enquiry.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Service Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-semibold capitalize">
                  {enquiry.service_required.replace(/-/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Customer Message</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{enquiry.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tokens */}
          {tokens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Booking Links ({tokens.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className={`p-3 rounded-md border ${
                      token.used
                        ? "bg-green-50 border-green-200"
                        : new Date(token.expires_at) < new Date()
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono">
                        {token.token.slice(0, 12)}...
                      </span>
                      <Badge
                        variant={token.used ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {token.used
                          ? "Used"
                          : new Date(token.expires_at) < new Date()
                          ? "Expired"
                          : "Active"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(token.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {formatDate(token.expires_at)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation
                </div>
                <div className="flex items-center gap-2">
                  {isUserOnline && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      User Online
                    </Badge>
                  )}
                </div>
              </CardTitle>
              {isUserTyping && (
                <p className="text-sm text-muted-foreground animate-pulse">User is typing...</p>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_type === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.message_text}
                        </p>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p
                            className={`text-xs ${
                              message.sender_type === "admin"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                          {message.sender_type === "admin" && (
                            <div className={`text-xs flex items-center gap-1 ${
                              message.sender_type === "admin"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}>
                              {message.read_at ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 space-y-3">
                <Textarea
                  placeholder="Type your message..."
                  value={messageContent}
                  onChange={(e) => {
                    setMessageContent(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={3}
                  disabled={sendingMessage || sendingLink}
                />
                
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={replyWithLink}
                      onChange={(e) => setReplyWithLink(e.target.checked)}
                      className="rounded"
                    />
                    Include booking link in message
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sendingMessage}
                    className="flex-1"
                  >
                    {sendingMessage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Message
                  </Button>
                  <Button
                    onClick={handleSendBookingLink}
                    disabled={sendingLink}
                    variant="secondary"
                  >
                    {sendingLink ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="mr-2 h-4 w-4" />
                    )}
                    Send Booking Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiryDetail;

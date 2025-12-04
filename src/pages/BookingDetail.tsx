import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, MapPin, DollarSign, Package, User, Mail, Phone, ArrowLeft, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomerChat from "@/components/chat/CustomerChat";

interface BookingDetail {
  id: string;
  enquiry_id: string;
  property_type: string;
  property_size: string;
  preferred_date: string;
  time_slot: string;
  status: string;
  estimated_price: number;
  special_instructions: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  pincode: string;
  service_type: string;
  enquiries: {
    id: string;
    service_required: string;
    name: string;
    email: string;
    phone: string;
    city: string;
  };
}

interface Message {
  id: string;
  message_text: string;
  sender_type: string;
  sender_name: string | null;
  created_at: string;
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (id) {
      fetchBookingDetail();
      fetchMessages();
    }
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          enquiries!inner(
            id,
            service_required,
            name,
            email,
            phone,
            city
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Not Found",
          description: "Booking not found or you don't have access to it",
          variant: "destructive",
        });
        navigate("/bookings");
        return;
      }

      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
      navigate("/bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!id) return;

    try {
      // First get the conversation for this enquiry
      const { data: booking } = await supabase
        .from("bookings")
        .select("enquiry_id")
        .eq("id", id)
        .single();

      if (!booking) return;

      const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("enquiry_id", booking.enquiry_id)
        .single();

      if (!conversation) return;

      // Fetch messages for this conversation
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`messages-${conversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversation.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message;
              setMessages((prev) => {
                // Check if message already exists to prevent duplicates
                if (prev.some(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    in_progress: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const timeSlotLabels: Record<string, string> = {
    morning: "Morning (8 AM - 12 PM)",
    afternoon: "Afternoon (12 PM - 4 PM)",
    evening: "Evening (4 PM - 8 PM)",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/bookings")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>

          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">ID: #{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Badge className={`${statusColors[booking.status]} text-lg px-4 py-2`}>
              {booking.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Service Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Type</label>
                    <p className="text-lg font-semibold mt-1">
                      {booking.service_type || booking.enquiries.service_required}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Property Type</label>
                      <p className="text-base font-semibold mt-1">{booking.property_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Property Size</label>
                      <p className="text-base font-semibold mt-1">{booking.property_size}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Special Instructions</label>
                    <p className="text-base mt-1">
                      {booking.special_instructions || "No special instructions provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Date</label>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(booking.preferred_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time Slot</label>
                    <p className="text-base mt-1">{timeSlotLabels[booking.time_slot] || booking.time_slot}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Service Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{booking.address_line1}</p>
                  {booking.address_line2 && <p className="text-base">{booking.address_line2}</p>}
                  <p className="text-base">
                    {booking.city} - {booking.pincode}
                  </p>
                </CardContent>
              </Card>

              {/* Messages */}
              {messages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messages ({messages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.sender_type === "admin"
                              ? "bg-blue-50 ml-8"
                              : "bg-gray-50 mr-8"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-sm">
                              {message.sender_type === "admin" ? "Admin" : "You"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message_text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">Estimated Price</p>
                    <p className="text-4xl font-bold text-green-600">
                      ₹{booking.estimated_price?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  
                  {booking.status === 'pending' && booking.estimated_price && (
                    <div className="mt-4 space-y-3">
                      <Button 
                        onClick={() => navigate(`/payment/checkout?bookingId=${booking.id}&amount=${booking.estimated_price}`)}
                        className="w-full"
                        size="lg"
                      >
                        💳 Pay Now
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Secure payment via Razorpay
                      </p>
                    </div>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <div className="mt-4 text-center">
                      <Badge className="bg-green-500">✓ Payment Completed</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{booking.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{booking.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Booking Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CustomerChat bookingId={id} isOpen={false} />
    </div>
  );
};

export default BookingDetail;

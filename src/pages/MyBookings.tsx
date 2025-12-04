import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, MapPin, DollarSign, Package, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomerChat from "@/components/chat/CustomerChat";

interface Enquiry {
  id: string;
  service_required: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  message: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  enquiry_id: string;
  property_type: string;
  property_size_sqft: number;
  preferred_date: string;
  preferred_time_slot: string;
  status: string;
  estimated_price: number;
  created_at: string;
  enquiries: {
    service_required: string;
    city: string;
  };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedEnquiryForChat, setSelectedEnquiryForChat] = useState<string | null>(null);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("enquiries");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate("/login");
        return;
      }

      setUser(authUser);

      // Fetch enquiries for this user
      const { data: enquiriesData, error: enquiriesError } = await supabase
        .from("enquiries")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (enquiriesError) throw enquiriesError;
      setEnquiries(enquiriesData || []);

      // Fetch bookings for this user
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          enquiries!inner(
            service_required,
            city,
            user_id
          )
        `)
        .eq("enquiries.user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load your services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    contacted: "bg-blue-400",
    quote_sent: "bg-indigo-500",
    confirmed: "bg-blue-600",
    in_progress: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const enquiryStatusLabels: Record<string, string> = {
    pending: "Pending Review",
    contacted: "Contacted by Admin",
    quote_sent: "Quote Sent",
  };

  const timeSlotLabels: Record<string, string> = {
    morning: "Morning (8 AM - 12 PM)",
    afternoon: "Afternoon (12 PM - 4 PM)",
    evening: "Evening (4 PM - 8 PM)",
  };

  // Separate bookings into active and completed
  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  
  // Filter enquiries that don't have bookings yet
  const bookingEnquiryIds = bookings.map(b => b.enquiry_id);
  const pendingEnquiries = enquiries.filter(e => !bookingEnquiryIds.includes(e.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Services
            </h1>
            <p className="text-gray-600 mt-2">Track your enquiries, bookings, and completed services</p>
          </div>

          {enquiries.length === 0 && bookings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Yet</h3>
                <p className="text-gray-500 mb-6">You haven't submitted any enquiries yet.</p>
                <Button onClick={() => navigate("/contact")}>
                  Submit an Enquiry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Mobile Dropdown */}
              <div className="block sm:hidden">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enquiries">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Enquiries ({pendingEnquiries.length})</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Active Bookings ({activeBookings.length})</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed ({completedBookings.length})</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full hidden sm:block">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="enquiries" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Enquiries ({pendingEnquiries.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Active Bookings ({activeBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed ({completedBookings.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Content for both mobile and desktop */}
              <div className="mt-6">{activeTab === "enquiries" && (
                <div className="space-y-6">{pendingEnquiries.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No pending enquiries</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingEnquiries.map((enquiry) => (
                    <Card key={enquiry.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl mb-2">
                              {enquiry.service_required.replace(/-/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Enquiry ID: #{enquiry.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <Badge className={statusColors[enquiry.status] || "bg-gray-500"}>
                            {enquiryStatusLabels[enquiry.status] || enquiry.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{enquiry.city}, {enquiry.state}</span>
                          </div>
                          {enquiry.message && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">{enquiry.message}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            Submitted on {new Date(enquiry.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedEnquiryForChat(enquiry.id)}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Chat with Admin
                          </Button>
                          {enquiry.status === 'pending' && (
                            <span className="text-xs text-gray-500 flex items-center">
                              Waiting for admin response...
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                </div>
              )}

              {activeTab === "active" && (
                <div className="space-y-6">
                {activeBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No active bookings</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl mb-2">
                              {booking.enquiries.service_required.replace(/-/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Booking ID: #{booking.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <Badge className={statusColors[booking.status] || "bg-gray-500"}>
                            {booking.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(booking.preferred_date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {timeSlotLabels[booking.preferred_time_slot]}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{booking.enquiries.city}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">{booking.property_type}</p>
                                <p className="text-xs text-gray-500">{booking.property_size_sqft} sq ft</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-lg font-bold text-green-600">
                                ${booking.estimated_price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Booked on {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedBookingForChat(booking.id)}
                              className="flex items-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Chat
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/bookings/${booking.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                </div>
              )}

              {activeTab === "completed" && (
                <div className="space-y-6">
                {completedBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No completed services yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-lg transition-shadow opacity-90">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl mb-2">
                              {booking.enquiries.service_required.replace(/-/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Booking ID: #{booking.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <Badge className={statusColors[booking.status] || "bg-gray-500"}>
                            {booking.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(booking.preferred_date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {timeSlotLabels[booking.preferred_time_slot]}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{booking.enquiries.city}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">{booking.property_type}</p>
                                <p className="text-xs text-gray-500">{booking.property_size_sqft} sq ft</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-lg font-bold text-green-600">
                                ${booking.estimated_price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Completed on {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                </div>
              )}
              </div>
            </div>
          )
        }</div>
      </main>
      <Footer />
      
      {/* Chat Modals */}
      {selectedEnquiryForChat && (
        <CustomerChat 
          enquiryId={selectedEnquiryForChat}
          isOpen={true}
          onClose={() => setSelectedEnquiryForChat(null)}
        />
      )}
      {selectedBookingForChat && (
        <CustomerChat 
          bookingId={selectedBookingForChat}
          isOpen={true}
          onClose={() => setSelectedBookingForChat(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, DollarSign, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate("/login");
        return;
      }

      setUser(authUser);

      // Fetch bookings for this user
      const { data, error } = await supabase
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

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-gray-600 mt-2">View and manage your service bookings</p>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
                <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
                <Button onClick={() => navigate("/contact")}>
                  Submit an Enquiry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;

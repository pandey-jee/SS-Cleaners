import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Save,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

interface Booking {
  id: string;
  enquiry_id: string;
  property_type: string;
  property_size: string;
  bedrooms: number | null;
  bathrooms: number | null;
  preferred_date: string;
  time_slot: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  add_ons: any;
  special_instructions: string | null;
  estimated_price: number;
  status: BookingStatus;
  payment_status: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Enquiry {
  name: string;
  email: string;
  phone: string;
  city: string;
  service_required: string;
  message: string;
}

const statusColors: Record<BookingStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  in_progress: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const timeSlotLabels: Record<string, string> = {
  morning: "Morning (8 AM - 12 PM)",
  afternoon: "Afternoon (12 PM - 4 PM)",
  evening: "Evening (4 PM - 8 PM)",
};

const AdminBookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);
      setAdminNotes(bookingData.admin_notes || "");
      setEstimatedPrice(bookingData.estimated_price.toString());

      const { data: enquiryData, error: enquiryError } = await supabase
        .from("enquiries")
        .select("*")
        .eq("id", bookingData.enquiry_id)
        .single();

      if (enquiryError) throw enquiryError;
      setEnquiry(enquiryData);
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!booking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setBooking({ ...booking, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Booking status changed to ${statusLabels[newStatus]}`,
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

  const handleSaveDetails = async () => {
    if (!booking) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          admin_notes: adminNotes || null,
          estimated_price: parseFloat(estimatedPrice) || booking.estimated_price,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Booking details updated successfully",
      });

      await fetchBookingDetails();
    } catch (error: any) {
      console.error("Error saving details:", error);
      toast({
        title: "Error",
        description: "Failed to save details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGoogleMapsUrl = () => {
    if (booking?.latitude && booking?.longitude) {
      return `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`;
    }
    const address = `${booking?.address_line1}, ${enquiry?.city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || !enquiry) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/admin/bookings")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
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
          onClick={() => navigate("/admin/bookings")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Booking #{booking.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created {formatDateTime(booking.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={booking.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
            {booking.payment_status === 'paid' && (
              <Badge className="bg-green-600">
                ✓ Paid
              </Badge>
            )}
            {booking.payment_status === 'pending' && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Payment Pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{enquiry.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${enquiry.phone}`} className="text-blue-600 hover:underline font-medium">
                  {enquiry.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${enquiry.email}`} className="text-blue-600 hover:underline">
                  {enquiry.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{enquiry.city}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Original Enquiry Message</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">{enquiry.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service & Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Service & Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold capitalize">
                    {enquiry.service_required.replace(/-/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium capitalize">{booking.property_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{booking.property_size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{booking.bedrooms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{booking.bathrooms || 'N/A'}</p>
                </div>
              </div>

              {booking.add_ons && booking.add_ons.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Additional Services</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.add_ons.map((addOn) => (
                      <Badge key={addOn} variant="secondary">
                        {addOn.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {booking.special_instructions && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Special Instructions</p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <p className="text-sm">{booking.special_instructions}</p>
                  </div>
                </div>
              )}
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
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Preferred Date</p>
                <p className="text-lg font-semibold">{formatDate(booking.preferred_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Slot</p>
                <p className="font-medium">{timeSlotLabels[booking.time_slot] || booking.time_slot}</p>
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
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-medium">{booking.address_line1}</p>
                {booking.address_line2 && <p className="font-medium">{booking.address_line2}</p>}
                <p className="font-medium">{enquiry.city}</p>
              </div>
              
              {booking.landmark && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Landmark</p>
                  <p className="font-medium">{booking.landmark}</p>
                </div>
              )}

              {booking.latitude && booking.longitude && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">GPS Coordinates</p>
                  <p className="font-mono text-sm">{booking.latitude}, {booking.longitude}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(getGoogleMapsUrl(), "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Maps
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="estimated_price">Estimated Price</Label>
                <Input
                  id="estimated_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="text-2xl font-bold text-green-600"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Update the estimated price based on actual requirements
              </p>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this booking..."
                rows={6}
              />
              <Button onClick={handleSaveDetails} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/admin/enquiries/${booking.enquiry_id}`)}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                View Original Enquiry
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = `mailto:${enquiry.email}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Customer
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = `tel:${enquiry.phone}`}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetail;

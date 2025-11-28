import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle2,
  Home,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Plus,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  service_required: string;
  message: string;
}

interface Token {
  id: string;
  enquiry_id: string;
  expires_at: string;
  used: boolean;
}

const bookingSchema = z.object({
  property_type: z.enum(["apartment", "house", "office", "commercial"]),
  property_size_sqft: z.number().min(100, "Property size must be at least 100 sq ft").max(50000),
  number_of_rooms: z.number().min(1).max(50),
  number_of_bathrooms: z.number().min(1).max(20),
  preferred_date: z.string().min(1, "Please select a date"),
  preferred_time_slot: z.enum(["morning", "afternoon", "evening"]),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  landmark: z.string().optional(),
  special_instructions: z.string().max(1000).optional(),
});

const addOnOptions = [
  { id: "deep_kitchen", label: "Deep Kitchen Cleaning", price: 50 },
  { id: "appliances", label: "Appliance Cleaning (Fridge, Oven)", price: 40 },
  { id: "windows", label: "Window Cleaning", price: 60 },
  { id: "carpet", label: "Carpet/Upholstery Cleaning", price: 80 },
  { id: "balcony", label: "Balcony/Outdoor Area Cleaning", price: 30 },
  { id: "organizing", label: "Organizing Services", price: 70 },
];

const CompleteBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");

  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [tokenData, setTokenData] = useState<Token | null>(null);

  const [formData, setFormData] = useState({
    property_type: "apartment" as const,
    property_size_sqft: "",
    number_of_rooms: "",
    number_of_bathrooms: "",
    preferred_date: "",
    preferred_time_slot: "morning" as const,
    address_line1: "",
    address_line2: "",
    landmark: "",
    latitude: "",
    longitude: "",
    special_instructions: "",
  });

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [capturingLocation, setCapturingLocation] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError("No booking token provided");
      setValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      // Fetch token details
      const { data: tokenData, error: tokenError } = await supabase
        .from("enquiry_tokens")
        .select("*")
        .eq("token", token)
        .single();

      if (tokenError || !tokenData) {
        setTokenError("Invalid booking token");
        setValidating(false);
        return;
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        setTokenError("This booking link has expired. Please contact us for a new link.");
        setValidating(false);
        return;
      }

      // Check if token is already used
      if (tokenData.used) {
        setTokenError("This booking link has already been used.");
        setValidating(false);
        return;
      }

      setTokenData(tokenData);

      // Fetch enquiry details
      const { data: enquiryData, error: enquiryError } = await supabase
        .from("enquiries")
        .select("*")
        .eq("id", tokenData.enquiry_id)
        .single();

      if (enquiryError || !enquiryData) {
        setTokenError("Unable to load enquiry details");
        setValidating(false);
        return;
      }

      setEnquiry(enquiryData);
      setTokenValid(true);
    } catch (error: any) {
      console.error("Error validating token:", error);
      setTokenError("An error occurred while validating your booking link");
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const captureLocation = () => {
    setCapturingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      setCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setLocationCaptured(true);
        setCapturingLocation(false);
        toast({
          title: "Location Captured",
          description: "Your GPS location has been saved",
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location Error",
          description: "Unable to capture your location. You can still submit the booking.",
        });
        setCapturingLocation(false);
      }
    );
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateEstimatedPrice = (): number => {
    // Base pricing logic (simplified)
    let basePrice = 100; // Starting price
    
    const size = parseInt(formData.property_size_sqft) || 0;
    const rooms = parseInt(formData.number_of_rooms) || 0;
    const bathrooms = parseInt(formData.number_of_bathrooms) || 0;

    // Size-based pricing
    if (size > 0) {
      basePrice += Math.floor(size / 100) * 5;
    }

    // Room-based pricing
    basePrice += rooms * 15;
    basePrice += bathrooms * 20;

    // Add-ons
    const addOnsPrice = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find((ao) => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    return basePrice + addOnsPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enquiry || !tokenData) return;

    setSubmitting(true);
    try {
      // Validate form data
      const validatedData = bookingSchema.parse({
        property_type: formData.property_type,
        property_size_sqft: parseInt(formData.property_size_sqft),
        number_of_rooms: parseInt(formData.number_of_rooms),
        number_of_bathrooms: parseInt(formData.number_of_bathrooms),
        preferred_date: formData.preferred_date,
        preferred_time_slot: formData.preferred_time_slot,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        landmark: formData.landmark,
        special_instructions: formData.special_instructions,
      });

      const estimatedPrice = calculateEstimatedPrice();

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      // Create booking with user_id if authenticated
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          enquiry_id: enquiry.id,
          user_id: user?.id || null, // Link to authenticated user
          property_type: validatedData.property_type,
          property_size_sqft: validatedData.property_size_sqft,
          number_of_rooms: validatedData.number_of_rooms,
          number_of_bathrooms: validatedData.number_of_bathrooms,
          preferred_date: validatedData.preferred_date,
          preferred_time_slot: validatedData.preferred_time_slot,
          address_line1: validatedData.address_line1,
          address_line2: validatedData.address_line2 || null,
          landmark: validatedData.landmark || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          add_ons: selectedAddOns,
          special_instructions: validatedData.special_instructions || null,
          estimated_price: estimatedPrice,
          booking_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Mark token as used
      const { error: tokenUpdateError } = await supabase
        .from("enquiry_tokens")
        .update({ used: true })
        .eq("id", tokenData.id);

      if (tokenUpdateError) {
        console.error("Error updating token:", tokenUpdateError);
      }

      // Update enquiry status
      const { error: enquiryUpdateError } = await supabase
        .from("enquiries")
        .update({ status: "booking_created" })
        .eq("id", enquiry.id);

      if (enquiryUpdateError) {
        console.error("Error updating enquiry:", enquiryUpdateError);
      }

      // Send confirmation emails
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          bookingId: booking.id,
          enquiryId: enquiry.id,
        },
      });

      setBookingId(booking.id);
      setSubmitted(true);

      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully created",
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Validating your booking link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Booking Link</AlertTitle>
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                If you need assistance, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  📞 <strong>+91 1234567890</strong>
                </p>
                <p className="text-sm">
                  📧 <strong>support@sspurecare.com</strong>
                </p>
              </div>
              <Button onClick={() => navigate("/")} className="w-full mt-4">
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-8 text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Booking Confirmed! 🎉</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for choosing SS PureCare! Your booking has been successfully created.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
              <p className="text-2xl font-mono font-bold text-blue-600">
                #{bookingId.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="bg-muted p-6 rounded-lg text-left mb-6">
              <h3 className="font-semibold mb-3">📋 What's Next?</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ You'll receive a confirmation email shortly</li>
                <li>📞 Our team will contact you within 24 hours</li>
                <li>💬 You can chat with us for any questions</li>
                <li>📅 We'll confirm your appointment date and time</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                Return to Homepage
              </Button>
              <Button onClick={() => navigate("/contact")} className="flex-1">
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Complete Your Booking</h1>
                <p className="text-muted-foreground">
                  Just a few more details to finalize your {enquiry?.service_required.replace(/-/g, " ")} service
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Information</p>
              <p className="font-semibold">{enquiry?.name}</p>
              <p className="text-sm">{enquiry?.email} • {enquiry?.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => handleChange("property_type", value)}
                    required
                  >
                    <SelectTrigger id="property_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="commercial">Commercial Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="property_size_sqft">Property Size (sq ft) *</Label>
                  <Input
                    id="property_size_sqft"
                    type="number"
                    min="100"
                    max="50000"
                    value={formData.property_size_sqft}
                    onChange={(e) => handleChange("property_size_sqft", e.target.value)}
                    placeholder="1500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="number_of_rooms">Number of Rooms *</Label>
                  <Input
                    id="number_of_rooms"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.number_of_rooms}
                    onChange={(e) => handleChange("number_of_rooms", e.target.value)}
                    placeholder="3"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="number_of_bathrooms">Number of Bathrooms *</Label>
                  <Input
                    id="number_of_bathrooms"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.number_of_bathrooms}
                    onChange={(e) => handleChange("number_of_bathrooms", e.target.value)}
                    placeholder="2"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Preferred Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_date">Preferred Date *</Label>
                  <Input
                    id="preferred_date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.preferred_date}
                    onChange={(e) => handleChange("preferred_date", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preferred_time_slot">Time Slot *</Label>
                  <Select
                    value={formData.preferred_time_slot}
                    onValueChange={(value) => handleChange("preferred_time_slot", value)}
                    required
                  >
                    <SelectTrigger id="preferred_time_slot">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                      <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => handleChange("address_line1", e.target.value)}
                  placeholder="Street address, building name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => handleChange("address_line2", e.target.value)}
                  placeholder="Apartment, suite, floor, etc."
                />
              </div>

              <div>
                <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                  placeholder="e.g., Near City Mall"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={captureLocation}
                  disabled={capturingLocation || locationCaptured}
                  className="w-full"
                >
                  {capturingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Capturing Location...
                    </>
                  ) : locationCaptured ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Location Captured
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Capture GPS Location (Optional)
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This helps us locate your property more accurately
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Additional Services (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {addOnOptions.map((addOn) => (
                <div key={addOn.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={addOn.id}
                      checked={selectedAddOns.includes(addOn.id)}
                      onCheckedChange={() => handleAddOnToggle(addOn.id)}
                    />
                    <Label htmlFor={addOn.id} className="cursor-pointer">
                      {addOn.label}
                    </Label>
                  </div>
                  <span className="font-semibold text-sm">+${addOn.price}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Special Instructions (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.special_instructions}
                onChange={(e) => handleChange("special_instructions", e.target.value)}
                placeholder="Any specific requirements, access instructions, or preferences..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.special_instructions.length}/1000 characters
              </p>
            </CardContent>
          </Card>

          {/* Estimated Price */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Price</p>
                  <p className="text-xs text-muted-foreground">Final price may vary based on actual requirements</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    ${calculateEstimatedPrice()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12 text-lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Your Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Confirm Booking
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteBooking;

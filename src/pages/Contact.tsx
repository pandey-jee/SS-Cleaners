import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UserRealtimeChat from "@/components/chat/UserRealtimeChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle2, MessageCircle, LogIn, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const Contact = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [enquiryId, setEnquiryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    service_required: "",
    message: "",
  });

  const contactSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
    email: z.string().email("Invalid email address").max(255, "Email too long"),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number (10-15 digits)"),
    city: z.string().trim().min(2, "City is required").max(100, "City name too long"),
    service_required: z.string().min(1, "Please select a service"),
    message: z.string().trim().min(1, "Message is required").max(2000, "Message too long")
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);
      
      // Insert enquiry into database with user_id if authenticated
      const { data: enquiry, error: enquiryError } = await supabase
        .from('enquiries')
        .insert({
          user_id: user.id, // Authenticated user ID
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          city: validatedData.city,
          service_required: validatedData.service_required,
          message: validatedData.message,
          status: 'new'
        })
        .select()
        .single();

      if (enquiryError) throw enquiryError;

      // Store enquiry ID for real-time chat
      setEnquiryId(enquiry.id);

      // Send notification email to admin
      const { error: notifError } = await supabase.functions.invoke('send-enquiry-notification', {
        body: {
          enquiryId: enquiry.id,
          notificationType: 'enquiry_received'
        }
      });

      if (notifError) {
        console.error('Notification error:', notifError);
        // Don't fail the submission if notification fails
      }

      // Show success state
      setSubmitted(true);
      toast({
        title: "Enquiry Submitted!",
        description: "We'll review your request and send you a detailed booking link within 24 hours.",
      });

    } catch (error: any) {
      console.error('Enquiry error:', error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message).join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      city: "",
      service_required: "",
      message: "",
    });
    setSubmitted(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 1234567890", "+91 9876543210"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@cigicare.com", "support@cigicare.com"],
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["123 Business Park", "Patna, Bihar 800001, India"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Sun: 7:00 AM - 9:00 PM", "Emergency: 24/7 Available"],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-background/90">
                Get in touch for a free consultation and quote
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="border-border hover:shadow-medium transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex p-3 bg-gradient-primary rounded-full mb-4">
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {info.title}
                      </h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Form and Map */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Contact Form */}
              {submitted ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Enquiry Received!</h2>
                    <p className="text-muted-foreground mb-4">
                      Thank you for your interest! We've received your enquiry and will review it shortly.
                    </p>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                      <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground mb-1">
                        💬 Chat with us in real-time!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click the chat button below to message our team instantly. No need to wait for email!
                      </p>
                    </div>
                    <Button onClick={resetForm} variant="outline">Submit Another Enquiry</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      Send Us a Message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Patna"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="service_required">Service Required *</Label>
                        <Select
                          value={formData.service_required}
                          onValueChange={(value) => handleChange('service_required', value)}
                          disabled={loading}
                        >
                          <SelectTrigger id="service_required">
                            <SelectValue placeholder="Select a service..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular-cleaning">Regular Cleaning</SelectItem>
                            <SelectItem value="deep-cleaning">Deep Cleaning</SelectItem>
                            <SelectItem value="move-in-out">Move-In/Out Cleaning</SelectItem>
                            <SelectItem value="office-cleaning">Office Cleaning</SelectItem>
                            <SelectItem value="window-cleaning">Window Cleaning</SelectItem>
                            <SelectItem value="carpet-cleaning">Carpet Cleaning</SelectItem>
                            <SelectItem value="post-construction">Post-Construction Cleaning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="message">Your Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us about your cleaning needs..."
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          required
                          disabled={loading}
                          rows={4}
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Enquiry'
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        After submission, we'll send you a personalized booking link within 24 hours.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Map or Additional Info */}
              <div className="space-y-6">
                <Card className="border-border">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Service Areas
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      We provide our services across multiple cities in Bihar and neighboring states:
                    </p>
                    <ul className="grid grid-cols-2 gap-3">
                      {["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Varanasi", "Lucknow", "Ranchi", "Jamshedpur"].map((city) => (
                        <li key={city} className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          {city}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border bg-gradient-secondary">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-xl font-bold text-secondary-foreground mb-3">
                      Emergency Services
                    </h3>
                    <p className="text-secondary-foreground/90 mb-4">
                      Need urgent cleaning service? We're available 24/7 for emergencies
                    </p>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="bg-background/10 border-background text-background hover:bg-background hover:text-secondary"
                    >
                      <a href="tel:+911234567890">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Emergency Line
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Login Required Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-2xl">Login Required</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              You need to be logged in to submit an enquiry. Please login or create an account to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowLoginAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate("/login", { state: { from: "/contact" } })}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Show real-time chat after enquiry submission */}
      {enquiryId && (
        <UserRealtimeChat 
          enquiryId={enquiryId}
          userEmail={formData.email}
          userName={formData.name}
        />
      )}
    </div>
  );
};

export default Contact;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import ServiceDetail from "./pages/services/ServiceDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminEnquiryDetail from "./pages/admin/AdminEnquiryDetail";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail";
import AdminServices from "./pages/admin/AdminServices";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminGallery from "./pages/admin/AdminGallery";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import BookingDetail from "./pages/BookingDetail";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MockCheckout from "./pages/payment/MockCheckout";
import PaymentSuccess from "./pages/payment/Success";
import PaymentCancel from "./pages/payment/Cancel";
import CompleteBooking from "./pages/booking/CompleteBooking";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            } />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/enquiries" element={<AdminEnquiries />} />
            <Route path="/admin/enquiries/:id" element={<AdminEnquiryDetail />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
            <Route path="/payment/mock-checkout" element={<MockCheckout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/booking/complete" element={<CompleteBooking />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

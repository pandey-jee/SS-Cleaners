import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Package, Users, DollarSign, MessageSquare, LogOut, Images, ClipboardList, CheckSquare, ExternalLink, Bell } from 'lucide-react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell';
import { toast } from 'sonner';

function DashboardContent() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    totalBookings: 0,
    totalServices: 0,
    totalRevenue: 0,
    newEnquiriesToday: 0,
    pendingBookings: 0
  });

  // Enable real-time notifications for admin
  useAdminNotifications({
    enabled: true,
    onNewEnquiry: () => {
      // Refresh stats when new enquiry arrives
      loadStats();
    },
    onNewMessage: () => {
      // Could update unread message count here
      console.log('New message received in admin portal');
    },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [enquiries, bookings, services] = await Promise.all([
      supabase.from('enquiries').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('estimated_price'),
      supabase.from('services').select('*', { count: 'exact', head: true })
    ]);

    const today = new Date().toISOString().split('T')[0];
    const { count: newEnquiries } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    const { count: pendingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Calculate total revenue from bookings
    const totalRevenue = bookings.data?.reduce((sum, booking) => {
      return sum + (parseFloat(booking.estimated_price?.toString() || '0'));
    }, 0) || 0;

    setStats({
      totalEnquiries: enquiries.count || 0,
      totalBookings: bookings.data?.length || 0,
      totalServices: services.count || 0,
      totalRevenue,
      newEnquiriesToday: newEnquiries || 0,
      pendingBookings: pendingCount || 0
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">SS PureCare Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <AdminNotificationBell />
            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Website
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">Manage your cleaning services business</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Enquiries</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnquiries}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newEnquiriesToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingBookings} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/enquiries">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <ClipboardList className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Customer Enquiries</CardTitle>
                <CardDescription>
                  View enquiries, chat with customers, send booking links
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CheckSquare className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Bookings & Orders</CardTitle>
                <CardDescription>
                  Manage confirmed bookings and track order status
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/services">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Package className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Manage Services</CardTitle>
                <CardDescription>
                  Add, edit, or remove cleaning services
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/gallery">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Images className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Gallery Management</CardTitle>
                <CardDescription>
                  Upload and manage work portfolio images
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/leads">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>AI Chatbot Leads</CardTitle>
                <CardDescription>
                  View leads generated from AI chatbot conversations
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/pricing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <DollarSign className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Pricing Matrix</CardTitle>
                <CardDescription>
                  Configure pricing for different service types
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

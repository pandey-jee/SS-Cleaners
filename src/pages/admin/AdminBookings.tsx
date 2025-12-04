import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw, Eye, MapPin, Calendar, ArrowLeft, ExternalLink } from "lucide-react";

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
  city: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  estimated_price: number;
  status: BookingStatus;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  enquiry: {
    name: string;
    email: string;
    phone: string;
    city: string;
    service_required: string;
  };
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

const AdminBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("bookings")
        .select(`
          *,
          enquiry:enquiries!enquiry_id (
            name,
            email,
            phone,
            city,
            service_required
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data || []);
    } catch (error: any) {
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

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.enquiry.name.toLowerCase().includes(searchLower) ||
      booking.enquiry.email.toLowerCase().includes(searchLower) ||
      booking.enquiry.phone.includes(searchLower) ||
      booking.address_line1.toLowerCase().includes(searchLower) ||
      booking.enquiry.city.toLowerCase().includes(searchLower) ||
      booking.id.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Bookings & Orders</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.open('/', '_blank')} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Website
            </Button>
            <Button onClick={fetchBookings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, address, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = bookings.filter((b) => b.status === status).length;
              const totalRevenue = bookings
                .filter((b) => b.status === status)
                .reduce((sum, b) => sum + b.estimated_price, 0);
              return (
                <Card key={status} className="text-center p-4">
                  <div className={`inline-block w-3 h-3 rounded-full ${statusColors[status as BookingStatus]} mb-2`} />
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-sm font-semibold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </Card>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{bookings.reduce((sum, b) => sum + b.estimated_price, 0).toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Avg Booking Value</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + b.estimated_price, 0) / bookings.length).toLocaleString('en-IN') : 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(booking.id)}
                    >
                      <TableCell className="font-mono text-xs">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.enquiry.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.enquiry.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {booking.enquiry.service_required.replace(/-/g, " ")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="capitalize">{booking.property_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.property_size} • {booking.bedrooms || 0}BR/{booking.bathrooms || 0}BA
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(booking.preferred_date)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {booking.time_slot}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-start gap-1 text-sm">
                          <MapPin className="h-3 w-3 mt-1 flex-shrink-0" />
                          <span className="truncate">{booking.address_line1}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{booking.enquiry.city}</p>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{booking.estimated_price}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(booking.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(booking.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  );
};

export default AdminBookings;

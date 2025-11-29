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
import { Loader2, Search, RefreshCw, Eye, ArrowLeft, ExternalLink } from "lucide-react";

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

const AdminEnquiries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEnquiries(data || []);
    } catch (error: any) {
      console.error("Error fetching enquiries:", error);
      toast({
        title: "Error",
        description: "Failed to load enquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      enquiry.name.toLowerCase().includes(searchLower) ||
      enquiry.email.toLowerCase().includes(searchLower) ||
      enquiry.phone.includes(searchLower) ||
      enquiry.city.toLowerCase().includes(searchLower) ||
      enquiry.service_required.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (enquiryId: string) => {
    navigate(`/admin/enquiries/${enquiryId}`);
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
            <h1 className="text-2xl font-bold">Customer Enquiries</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.open('/', '_blank')} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Website
            </Button>
            <Button onClick={fetchEnquiries} variant="outline" size="sm">
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
                placeholder="Search by name, email, phone, city, or service..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="link_sent">Link Sent</SelectItem>
                <SelectItem value="booking_created">Booking Created</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = enquiries.filter((e) => e.status === status).length;
              return (
                <Card key={status} className="text-center p-4">
                  <div className={`inline-block w-3 h-3 rounded-full ${statusColors[status as EnquiryStatus]} mb-2`} />
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </Card>
              );
            })}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No enquiries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnquiries.map((enquiry) => (
                    <TableRow
                      key={enquiry.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(enquiry.id)}
                    >
                      <TableCell className="font-mono text-xs">
                        #{enquiry.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">{enquiry.name}</TableCell>
                      <TableCell className="text-sm">{enquiry.email}</TableCell>
                      <TableCell className="text-sm">{enquiry.phone}</TableCell>
                      <TableCell>{enquiry.city}</TableCell>
                      <TableCell className="text-sm capitalize">
                        {enquiry.service_required.replace(/-/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[enquiry.status]}>
                          {statusLabels[enquiry.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(enquiry.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(enquiry.id);
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

export default AdminEnquiries;

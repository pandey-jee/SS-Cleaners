import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  city: string | null;
  service_type: string | null;
  status: string | null;
  created_at: string | null;
  estimated_price: string | null;
}

function AdminLeadsContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Enable real-time notifications and auto-refresh on new enquiry
  useAdminNotifications({
    enabled: true,
    onNewEnquiry: () => {
      loadLeads(); // Refresh the list
    },
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive'
      });
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'converted': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
            <h1 className="text-2xl font-bold">Manage Leads</h1>
          </div>
          <Button onClick={() => window.open('/', '_blank')} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Website
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Leads & Bookings</CardTitle>
            <CardDescription>All inquiries and booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No leads yet</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="text-sm">
                          {lead.created_at 
                            ? new Date(lead.created_at).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.name || 'Anonymous'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{lead.service_type || 'N/A'}</TableCell>
                        <TableCell>
                          {lead.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.city}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{lead.estimated_price || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status || 'new'}
                          </Badge>
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
}

export default function AdminLeads() {
  return (
    <ProtectedRoute>
      <AdminLeadsContent />
    </ProtectedRoute>
  );
}

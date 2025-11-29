import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface PricingEntry {
  id: string;
  service_id: string;
  property_type: string;
  size_category: string;
  base_price: number;
  add_ons: any;
}

interface Service {
  id: string;
  name: string;
}

function AdminPricingContent() {
  const [pricing, setPricing] = useState<PricingEntry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    service_id: '',
    property_type: '',
    size_category: '',
    base_price: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [pricingData, servicesData] = await Promise.all([
      supabase.from('pricing_matrix').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('id, name')
    ]);

    if (pricingData.data) setPricing(pricingData.data);
    if (servicesData.data) setServices(servicesData.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('pricing_matrix')
      .insert([{
        service_id: formData.service_id,
        property_type: formData.property_type,
        size_category: formData.size_category,
        base_price: parseFloat(formData.base_price)
      }]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add pricing',
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Success', description: 'Pricing added successfully' });
      setDialogOpen(false);
      setFormData({ service_id: '', property_type: '', size_category: '', base_price: '' });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing entry?')) return;

    const { error } = await supabase
      .from('pricing_matrix')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Pricing deleted' });
      loadData();
    }
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown';
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
            <h1 className="text-2xl font-bold">Pricing Matrix</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.open('/', '_blank')} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Website
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pricing
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Pricing Entry</DialogTitle>
                <DialogDescription>Configure pricing for a service category</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service_id">Service</Label>
                  <Select
                    value={formData.service_id}
                    onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Input
                    id="property_type"
                    placeholder="e.g., house, office"
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_category">Size Category</Label>
                  <Input
                    id="size_category"
                    placeholder="e.g., 1BHK, 2BHK, small_office"
                    value={formData.size_category}
                    onChange={(e) => setFormData({ ...formData, size_category: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price (₹)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Pricing</Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
            <CardDescription>Manage pricing for different service types and categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : pricing.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pricing entries yet. Click "Add Pricing" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Size Category</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {getServiceName(entry.service_id)}
                      </TableCell>
                      <TableCell>{entry.property_type}</TableCell>
                      <TableCell>{entry.size_category}</TableCell>
                      <TableCell>₹{entry.base_price}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AdminPricing() {
  return (
    <ProtectedRoute>
      <AdminPricingContent />
    </ProtectedRoute>
  );
}

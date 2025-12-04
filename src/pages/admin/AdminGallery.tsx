import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Upload, ExternalLink } from 'lucide-react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { compressAndResizeImage } from '@/lib/imageCompression';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  before_image_url: string | null;
  service_type: string | null;
  display_order: number;
  is_active: boolean;
}

function AdminGalleryContent() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    before_image_url: '',
    service_type: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order');

    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'after' | 'before' = 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Compress and resize image
      const compressedBlob = await compressAndResizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, compressedBlob);

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'Failed to upload image',
          variant: 'destructive'
        });
        setUploadingImage(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      if (type === 'after') {
        setFormData({ ...formData, image_url: publicUrl });
      } else {
        setFormData({ ...formData, before_image_url: publicUrl });
      }
      
      toast({ title: 'Success', description: 'Image uploaded and compressed successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const compressedBlob = await compressAndResizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(filePath, compressedBlob);

        if (uploadError) {
          errorCount++;
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('gallery')
          .insert([{
            title: file.name.replace(/\.[^/.]+$/, ''),
            image_url: publicUrl,
            is_active: true,
            display_order: images.length + i
          }]);

        if (insertError) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setUploadingImage(false);
    
    if (successCount > 0) {
      toast({ 
        title: 'Success', 
        description: `${successCount} image(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}` 
      });
      loadImages();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast({
        title: 'Error',
        description: 'Please upload an image',
        variant: 'destructive'
      });
      return;
    }

    const imageData = {
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url,
      before_image_url: formData.before_image_url || null,
      service_type: formData.service_type || null,
      is_active: formData.is_active,
      display_order: formData.display_order
    };

    if (editingImage) {
      const { error } = await supabase
        .from('gallery')
        .update(imageData)
        .eq('id', editingImage.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update image',
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Success', description: 'Image updated successfully' });
        setDialogOpen(false);
        loadImages();
      }
    } else {
      const { error } = await supabase
        .from('gallery')
        .insert([imageData]);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add image',
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Success', description: 'Image added successfully' });
        setDialogOpen(false);
        loadImages();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Success', description: 'Image deleted' });
      loadImages();
    }
  };

  const openDialog = (image?: GalleryImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title,
        description: image.description || '',
        image_url: image.image_url,
        before_image_url: image.before_image_url || '',
        service_type: image.service_type || '',
        is_active: image.is_active,
        display_order: image.display_order
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        before_image_url: '',
        service_type: '',
        is_active: true,
        display_order: images.length
      });
    }
    setDialogOpen(true);
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
            <h1 className="text-2xl font-bold">Manage Gallery</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.open('/', '_blank')} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Website
            </Button>
            <div className="relative">
              <Input
                id="bulk-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('bulk-upload')?.click()}
                disabled={uploadingImage}
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingImage ? 'Edit Gallery Image' : 'Add New Image'}
                </DialogTitle>
                <DialogDescription>
                  Upload and configure gallery image
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Input
                    id="service_type"
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    placeholder="e.g., House Cleaning, Office Cleaning"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="before-image">Before Image (Optional)</Label>
                  {formData.before_image_url && (
                    <img src={formData.before_image_url} alt="Before Preview" className="w-full h-48 object-cover rounded-md mb-2" />
                  )}
                  <Input
                    id="before-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'before')}
                    disabled={uploadingImage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">After Image*</Label>
                  {formData.image_url && (
                    <img src={formData.image_url} alt="After Preview" className="w-full h-48 object-cover rounded-md mb-2" />
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'after')}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p className="text-sm text-muted-foreground">Uploading and compressing...</p>}
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingImage ? 'Update' : 'Add'} Image
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : images.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No images yet. Click "Add Image" to upload one.
            </div>
          ) : (
            images.map((image) => (
              <Card key={image.id}>
                <CardHeader>
                  <img 
                    src={image.image_url} 
                    alt={image.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{image.title}</CardTitle>
                      <CardDescription>{image.service_type}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(image)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={image.is_active ? 'text-green-600' : 'text-red-600'}>
                        {image.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {image.description && (
                      <p className="text-muted-foreground">{image.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminGallery() {
  return (
    <ProtectedRoute>
      <AdminGalleryContent />
    </ProtectedRoute>
  );
}

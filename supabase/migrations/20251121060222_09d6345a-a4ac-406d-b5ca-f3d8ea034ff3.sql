-- Create storage buckets for service and gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('service-images', 'service-images', true),
  ('gallery-images', 'gallery-images', true);

-- Create gallery table for previous work images
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  service_type TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gallery table
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery
CREATE POLICY "Anyone can view active gallery images"
ON public.gallery
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage gallery"
ON public.gallery
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for service-images bucket
CREATE POLICY "Service images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Admins can upload service images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete service images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for gallery-images bucket
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Admins can upload gallery images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gallery-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'gallery-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'gallery-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for gallery updated_at
CREATE TRIGGER update_gallery_updated_at
BEFORE UPDATE ON public.gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
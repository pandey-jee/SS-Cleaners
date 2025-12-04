-- Add before_image_url to gallery table for before/after comparisons
ALTER TABLE public.gallery ADD COLUMN before_image_url text;
-- Create storage bucket for community post images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-images', 'community-images', true);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  tipo TEXT NOT NULL DEFAULT 'discussion' CHECK (tipo IN ('discussion', 'achievement', 'question', 'event')),
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
CREATE POLICY "Everyone can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = usuario_id OR is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for community images
CREATE POLICY "Anyone can view community images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'community-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own community images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'community-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own community images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'community-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
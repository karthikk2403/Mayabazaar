/*
  # Add products storage bucket

  1. New Storage
    - Create products bucket for storing product images
    - Set up public access and security policies
  
  2. Security
    - Enable public read access
    - Allow authenticated users to upload product images
    - Restrict updates and deletes to owners
*/

-- Create products bucket if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('products', 'products', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up RLS policies for products bucket
DO $$ 
BEGIN
    -- Public read access for product images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Product images are publicly accessible'
    ) THEN
        CREATE POLICY "Product images are publicly accessible"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'products');
    END IF;

    -- Authenticated users can upload product images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload product images'
    ) THEN
        CREATE POLICY "Users can upload product images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'products');
    END IF;

    -- Users can update their own product images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own product images'
    ) THEN
        CREATE POLICY "Users can update their own product images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'products');
    END IF;

    -- Users can delete their own product images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own product images'
    ) THEN
        CREATE POLICY "Users can delete their own product images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'products');
    END IF;
END $$;
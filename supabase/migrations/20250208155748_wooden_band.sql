/*
  # Configure storage for avatars
  
  1. Storage Configuration
    - Create avatars bucket for user profile pictures
    - Set up RLS policies for secure access
  
  2. Security
    - Public read access for avatar images
    - Authenticated users can manage their own avatars
*/

-- Create avatars bucket if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up RLS policies for avatars bucket
DO $$ 
BEGIN
    -- Public read access for avatar images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'avatars');
    END IF;

    -- Authenticated users can upload their own avatar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload their own avatar'
    ) THEN
        CREATE POLICY "Users can upload their own avatar"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'avatars' 
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Authenticated users can update their own avatar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own avatar'
    ) THEN
        CREATE POLICY "Users can update their own avatar"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'avatars' 
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Authenticated users can delete their own avatar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own avatar'
    ) THEN
        CREATE POLICY "Users can delete their own avatar"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'avatars' 
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;
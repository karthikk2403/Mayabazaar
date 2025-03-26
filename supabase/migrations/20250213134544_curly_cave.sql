/*
  # Fix Product-Profile Relationship

  1. Changes
    - Add proper foreign key relationship between products and profiles
    - Update existing constraints
    - Add necessary indexes
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing constraint if it exists
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_seller_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE products
ADD CONSTRAINT products_seller_id_fkey
FOREIGN KEY (seller_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_end_time ON products(end_time);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_end_time 
ON products(category, end_time);

-- Update RLS policies to use the new relationship
DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
CREATE POLICY "Authenticated users can create products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = seller_id::text);

DROP POLICY IF EXISTS "Sellers can update their own products" ON products;
CREATE POLICY "Sellers can update their own products"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid()::text = seller_id::text);
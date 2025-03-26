/*
  # Add foreign key relationships for products table
  
  1. Changes
    - Add foreign key relationship between products and auth.users
    - Update existing tables to use proper relationships
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add foreign key relationship for seller_id
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_seller_id_fkey,
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
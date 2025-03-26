/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `location` (text)
      - `phone` (text)
      - `interests` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `current_bid` (numeric)
      - `starting_bid` (numeric)
      - `category` (text)
      - `end_time` (timestamptz)
      - `seller_id` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)

    - `bids`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `bidder_id` (uuid, foreign key to profiles)
      - `amount` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  avatar_url text,
  bio text,
  location text,
  phone text,
  interests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  current_bid numeric NOT NULL,
  starting_bid numeric NOT NULL,
  category text NOT NULL,
  end_time timestamptz NOT NULL,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    
    -- Products policies
    DROP POLICY IF EXISTS "Anyone can view products" ON products;
    DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
    DROP POLICY IF EXISTS "Sellers can update their own products" ON products;
    
    -- Bids policies
    DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
    DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
END $$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Bids policies
CREATE POLICY "Anyone can view bids"
  ON bids
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can place bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

-- Add updated_at trigger to profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_end_time;
DROP INDEX IF EXISTS idx_products_category_end_time;
DROP INDEX IF EXISTS idx_products_seller_id;
DROP INDEX IF EXISTS idx_bids_product_id;
DROP INDEX IF EXISTS idx_bids_bidder_id;

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_end_time ON products(end_time);
CREATE INDEX idx_products_category_end_time ON products(category, end_time);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_bids_product_id ON bids(product_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
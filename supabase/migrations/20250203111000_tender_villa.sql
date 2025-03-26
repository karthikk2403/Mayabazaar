/*
  # Initial Schema Setup for MayaBazaar

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `current_bid` (numeric)
      - `starting_bid` (numeric)
      - `category` (text)
      - `end_time` (timestamptz)
      - `seller_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
    
    - `bids`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `bidder_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

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
  seller_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products NOT NULL,
  bidder_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies for products
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

-- Policies for bids
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
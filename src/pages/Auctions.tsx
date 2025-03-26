import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Award } from 'lucide-react';
import { formatPrice, formatTimeLeft, staggerContainer, fadeIn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export const SAMPLE_ITEMS = {
  "Jewelry": [
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Victorian Diamond Necklace",
      description: "Exquisite 19th century diamond necklace with intricate filigree work",
      image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
      current_bid: 5000,
      starting_bid: 3000,
      end_time: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      seller: "Victoria Antiques",
      status: "ongoing"
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174001",
      title: "Art Deco Ruby Ring",
      description: "1920s art deco ring featuring a natural ruby",
      image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
      current_bid: 2800,
      starting_bid: 1500,
      end_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      seller: "Vintage Gems",
      status: "completed",
      winner: "Anonymous Bidder"
    }
  ],
  "Furniture": [
    {
      id: "123e4567-e89b-12d3-a456-426614174002",
      title: "Queen Anne Writing Desk",
      description: "18th century mahogany writing desk in excellent condition",
      image_url: "https://images.unsplash.com/photo-1517705008128-361805f42e86",
      current_bid: 8500,
      starting_bid: 5000,
      end_time: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      seller: "Heritage Furniture",
      status: "ongoing"
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174003",
      title: "French Provincial Armoire",
      description: "Late 19th century armoire with original brass fittings",
      image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      current_bid: 6200,
      starting_bid: 4000,
      end_time: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      seller: "Antique Masters",
      status: "completed",
      winner: "Classic Collector"
    }
  ],
  "Art": [
    {
      id: "123e4567-e89b-12d3-a456-426614174004",
      title: "19th Century Oil Painting",
      description: "Pastoral landscape by renowned artist",
      image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9",
      current_bid: 12000,
      starting_bid: 8000,
      end_time: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
      seller: "Fine Arts Gallery",
      status: "ongoing"
    }
  ],
  "Books": [
    {
      id: "123e4567-e89b-12d3-a456-426614174005",
      title: "First Edition Dickens",
      description: "First edition of Great Expectations, 1861",
      image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      current_bid: 15000,
      starting_bid: 10000,
      end_time: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      seller: "Rare Books Ltd",
      status: "ongoing"
    }
  ],
  "Coins": [
    {
      id: "123e4567-e89b-12d3-a456-426614174006",
      title: "1804 Silver Dollar",
      description: "Extremely rare Class I Original 1804 Silver Dollar",
      image_url: "https://images.unsplash.com/photo-1621778455241-2aa5b2f8c20b",
      current_bid: 25000,
      starting_bid: 20000,
      end_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      seller: "Numismatic Treasures",
      status: "ongoing"
    }
  ],
  "Collectibles": [
    {
      id: "123e4567-e89b-12d3-a456-426614174007",
      title: "1950s Coca-Cola Machine",
      description: "Fully restored vintage Coca-Cola vending machine",
      image_url: "https://images.unsplash.com/photo-1534073828943-f801091bb18c",
      current_bid: 4500,
      starting_bid: 3000,
      end_time: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
      seller: "Vintage Collectibles",
      status: "ongoing"
    }
  ]
};

const CATEGORIES = [
  { name: "Jewelry", icon: "💍" },
  { name: "Furniture", icon: "🪑" },
  { name: "Art", icon: "🎨" },
  { name: "Books", icon: "📚" },
  { name: "Coins", icon: "🪙" },
  { name: "Collectibles", icon: "🏺" },
];

export default function Auctions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            seller:profiles(id, name, avatar_url, created_at)
          `)
          .order('created_at', { ascending: false });

        // Add category filter if selected
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }

        const { data: dbProducts, error } = await query;

        if (error) throw error;

        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          // Fall back to sample data if no products in database
          const items = selectedCategory 
            ? SAMPLE_ITEMS[selectedCategory] || []
            : Object.values(SAMPLE_ITEMS).flat();
          setProducts(items);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fall back to sample data on error
        const items = selectedCategory 
          ? SAMPLE_ITEMS[selectedCategory] || []
          : Object.values(SAMPLE_ITEMS).flat();
        setProducts(items);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  const handleProductClick = (productId) => {
    navigate(`/auctions/${productId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-serif text-4xl font-bold text-gray-900"
        >
          {selectedCategory ? `${selectedCategory} Auctions` : 'All Auctions'}
        </motion.h1>

        {/* Categories */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          {CATEGORIES.map((category) => (
            <motion.a
              key={category.name}
              variants={fadeIn}
              href={`/auctions?category=${category.name}`}
              className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-50'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading ? (
            <div className="col-span-full text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading auctions...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No auctions found.</p>
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeIn}
                onClick={() => handleProductClick(product.id)}
                className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-w-3 aspect-h-2">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.status === 'completed' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="rounded-lg bg-white p-3 text-center">
                        <Award className="mx-auto h-8 w-8 text-amber-800" />
                        <p className="mt-2 text-sm font-semibold">
                          Won by {product.winner}
                        </p>
                      </div>
                     </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold text-gray-900">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Current Bid:{' '}
                        <span className="font-semibold text-amber-800">
                          {formatPrice(product.current_bid)}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Starting at: {formatPrice(product.starting_bid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        <Clock className="mr-1 inline-block h-4 w-4" />
                        {product.status === 'completed' 
                          ? 'Auction ended' 
                          : formatTimeLeft(new Date(product.end_time))}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Seller: {product.seller?.name || product.seller}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
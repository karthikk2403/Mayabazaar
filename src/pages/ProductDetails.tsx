import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Clock, DollarSign, Award, User, Calendar, ArrowLeft, Loader2, Heart, Share2, Shield, AlignCenterVertical as Certificate, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import { formatPrice, formatTimeLeft } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { SAMPLE_ITEMS } from './Auctions';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [showBidHistory, setShowBidHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        // Check if the ID is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!uuidRegex.test(id)) {
          // If not a UUID, try to find in sample data
          const allSampleProducts = Object.values(SAMPLE_ITEMS).flat();
          const sampleProduct = allSampleProducts.find(p => p.id === id);
          
          if (sampleProduct) {
            if (isMounted) {
              setProduct({
                ...sampleProduct,
                seller: {
                  name: sampleProduct.seller,
                  avatar_url: null,
                  created_at: new Date().toISOString()
                }
              });
              setLoading(false);
            }
            return;
          }
          
          throw new Error('Product not found');
        }

        // If it's a UUID, fetch from database
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            seller:profiles!products_seller_id_fkey (
              id,
              name,
              avatar_url,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (productError) {
          if (productError.code === 'PGRST116') {
            throw new Error('Product not found');
          }
          throw productError;
        }

        if (isMounted && productData) {
          setProduct(productData);
          loadBidHistory(productData.id);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        if (isMounted) {
          setError(error.message);
          if (error.message === 'Product not found') {
            toast.error('Product not found');
            navigate('/auctions');
          } else {
            toast.error('Failed to load product details');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function loadBidHistory(productId) {
      try {
        const { data: bids, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            bidder:profiles!bids_bidder_id_fkey (
              name,
              avatar_url
            )
          `)
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (bidsError) throw bidsError;

        if (isMounted) {
          setBidHistory(bids || []);
        }
      } catch (error) {
        console.error('Error loading bid history:', error);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= product.current_bid) {
      toast.error(`Bid must be higher than ${formatPrice(product.current_bid)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .insert({
          product_id: id,
          bidder_id: user.id,
          amount: amount,
        })
        .select()
        .single();

      if (error) throw error;

      // Update product's current bid
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_bid: amount })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setProduct(prev => ({ ...prev, current_bid: amount }));
      setBidHistory(prev => [{
        ...data,
        bidder: { name: user.name, avatar_url: user.avatar_url }
      }, ...prev]);

      toast.success('Bid placed successfully!');
      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    toast.success(isWatchlisted ? 'Removed from watchlist' : 'Added to watchlist');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
            <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/auctions')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Auctions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(product.end_time) < new Date();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAF3E3] py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => navigate('/auctions')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Auctions
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Image and Details */}
          <div className="space-y-8">
            <div className="group relative overflow-hidden rounded-lg bg-white shadow-vintage">
              <img
                src={product.image_url}
                alt={product.title}
                className="h-[500px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleWatchlist}
                  className="backdrop-blur-md"
                >
                  <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="backdrop-blur-md"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-vintage">
              <h2 className="font-serif text-xl font-semibold text-gray-900">Product Details</h2>
              <p className="mt-4 leading-relaxed text-gray-600">{product.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-amber-50 p-4">
                  <dt className="text-sm text-gray-500">Category</dt>
                  <dd className="mt-1 font-medium text-gray-900">{product.category}</dd>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                  <dt className="text-sm text-gray-500">Condition</dt>
                  <dd className="mt-1 font-medium text-gray-900">{product.condition || 'Vintage'}</dd>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4 text-amber-800" />
                  <span>Authenticity Guaranteed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Certificate className="h-4 w-4 text-amber-800" />
                  <span>Expert Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Auction Info */}
          <div className="space-y-8">
            <div className="rounded-lg bg-white p-6 shadow-vintage">
              <h1 className="font-serif text-3xl font-bold text-gray-900">{product.title}</h1>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-amber-50 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Bid:</span>
                    <span className="text-3xl font-bold text-amber-800">
                      {formatPrice(product.current_bid)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-gray-600">Starting Bid:</span>
                    <span className="text-lg text-gray-900">
                      {formatPrice(product.starting_bid)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-gray-600">Time Left:</span>
                    <span className="flex items-center text-lg font-medium text-gray-900">
                      <Clock className="mr-2 h-5 w-5 text-amber-800" />
                      {isExpired ? 'Auction ended' : formatTimeLeft(new Date(product.end_time))}
                    </span>
                  </div>
                </div>

                {!isExpired && (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter bid amount (min: ${formatPrice(product.current_bid + 100)})`}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleBid} 
                        disabled={isSubmitting}
                        className="w-32"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Bid
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      * Minimum bid increment is {formatPrice(100)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information */}
            <div className="rounded-lg bg-white p-6 shadow-vintage">
              <h2 className="font-serif text-xl font-semibold text-gray-900">Seller Information</h2>
              <div className="mt-4 flex items-center">
                <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-amber-100">
                  <img
                    src={product.seller.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.name)}&background=amber&color=fff`}
                    alt={product.seller.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{product.seller.name}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    <span>
                      <Calendar className="mr-1 inline h-4 w-4" />
                      Joined {new Date(product.seller.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div className="rounded-lg bg-white p-6 shadow-vintage">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold text-gray-900">Bid History</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBidHistory(!showBidHistory)}
                >
                  <History className="mr-2 h-4 w-4" />
                  {showBidHistory ? 'Hide History' : 'Show History'}
                </Button>
              </div>

              <AnimatePresence>
                {showBidHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 max-h-[300px] overflow-y-auto space-y-4"
                  >
                    {bidHistory.length === 0 ? (
                      <p className="text-center text-gray-500">No bids yet</p>
                    ) : (
                      bidHistory.map((bid) => (
                        <motion.div
                          key={bid.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 overflow-hidden rounded-full">
                              <img
                                src={bid.bidder.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.bidder.name)}&background=amber&color=fff`}
                                alt={bid.bidder.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{bid.bidder.name}</span>
                              <p className="text-sm text-gray-500">
                                {new Date(bid.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-amber-800">
                            {formatPrice(bid.amount)}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-lg bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold">Share this item</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                    setShowShareModal(false);
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=Check out this amazing item on MayaBazaar!&url=${encodeURIComponent(window.location.href)}`);
                    setShowShareModal(false);
                  }}
                >
                  Share on Twitter
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProductDetails;
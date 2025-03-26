import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  currentBid: number;
  minIncrement: number;
  onBidPlaced: () => void;
}

export function BidModal({ isOpen, onClose, productId, currentBid, minIncrement, onBidPlaced }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + minIncrement);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, addBid } = useAuthStore();

  const handleBid = async () => {
    if (bidAmount <= currentBid) {
      toast.error(`Bid must be at least ${formatPrice(currentBid + minIncrement)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('bids').insert({
        product_id: productId,
        bidder_id: user?.id,
        amount: bidAmount,
      });

      if (error) throw error;

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(
        <div className="text-center">
          <p className="font-bold">Congratulations! 🎉</p>
          <p>Your bid of {formatPrice(bidAmount)} has been placed successfully!</p>
        </div>
      );

      addBid({
        id: Math.random().toString(),
        productId,
        amount: bidAmount,
        timestamp: new Date(),
      });

      onBidPlaced();
      onClose();
    } catch (error) {
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-gray-900">Place Your Bid</h2>
            
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-sm text-gray-600">Current Highest Bid:</p>
                <p className="text-lg font-bold text-amber-800">{formatPrice(currentBid)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Bid Amount
                </label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={currentBid + minIncrement}
                  step={minIncrement}
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum bid: {formatPrice(currentBid + minIncrement)}
                </p>
              </div>

              <Button
                onClick={handleBid}
                className="w-full"
                disabled={isSubmitting || bidAmount <= currentBid}
              >
                {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
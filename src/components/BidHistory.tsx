import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Award } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export function BidHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const { bids } = useAuthStore();

  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleBidClick = (bid) => {
    setSelectedBid(selectedBid?.id === bid.id ? null : bid);
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100"
      >
        <span className="font-serif text-lg font-semibold text-amber-900">
          Bid History ({bids.length})
        </span>
        <ChevronDown
          className={`h-5 w-5 transform text-amber-800 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {sortedBids.length === 0 ? (
                <p className="text-center text-gray-500">No bids yet</p>
              ) : (
                sortedBids.map((bid) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-lg border border-amber-100 bg-white shadow-sm"
                  >
                    <div 
                      onClick={() => handleBidClick(bid)}
                      className="cursor-pointer p-4 hover:bg-amber-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {bid.product.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Seller: {bid.product.seller}
                          </p>
                        </div>
                        <img
                          src={bid.product.image_url}
                          alt={bid.product.title}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Your bid: <span className="font-semibold text-amber-800">
                              {formatPrice(bid.amount)}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            <Clock className="mr-1 inline-block h-3 w-3" />
                            {new Date(bid.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {bid.product.status === 'completed' && (
                          <div className={`flex items-center rounded-full px-3 py-1 text-sm ${
                            bid.product.winner === 'You' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <Award className="mr-1 h-4 w-4" />
                            {bid.product.winner === 'You' ? 'Won' : 'Lost'}
                          </div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedBid?.id === bid.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-amber-100 bg-amber-50/50"
                        >
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900">Bid Details</h4>
                            <dl className="mt-2 space-y-2 text-sm">
                              <div>
                                <dt className="text-gray-500">Starting Price</dt>
                                <dd className="font-medium text-gray-900">
                                  {formatPrice(bid.product.starting_bid)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Final Price</dt>
                                <dd className="font-medium text-gray-900">
                                  {formatPrice(bid.product.current_bid)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Auction End Date</dt>
                                <dd className="font-medium text-gray-900">
                                  {new Date(bid.product.end_time).toLocaleDateString()}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Winner</dt>
                                <dd className="font-medium text-gray-900">
                                  {bid.product.winner || 'Auction in progress'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
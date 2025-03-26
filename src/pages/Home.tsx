import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FEATURED_ITEMS = [
  {
    id: 1,
    title: "19th Century Brass Telescope",
    image: "https://images.unsplash.com/photo-1589182337358-2cb63099350c",
    currentBid: 1200,
    endTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
  },
  {
    id: 2,
    title: "Antique Persian Carpet",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843",
    currentBid: 4500,
    endTime: new Date(Date.now() + 86400000 * 3), // 3 days from now
  },
  {
    id: 3,
    title: "Victorian Era Writing Desk",
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86",
    currentBid: 3200,
    endTime: new Date(Date.now() + 86400000), // 1 day from now
  },
];

const CATEGORIES = [
  { name: "Jewelry", icon: "💍" },
  { name: "Furniture", icon: "🪑" },
  { name: "Art", icon: "🎨" },
  { name: "Books", icon: "📚" },
  { name: "Coins", icon: "🪙" },
  { name: "Collectibles", icon: "🏺" },
];

export function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=2000")',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-center sm:text-left">
            <h1 className="font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Reviving the Glory of the Past
            </h1>
            <p className="mt-6 text-xl text-gray-100">
              Discover unique antiques and artifacts from around the world. 
              Bid on history, own a piece of the past.
            </p>
            <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link to="/auctions">
                <Button size="lg">
                  Browse Auctions
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-gray-900">
            Featured Auctions
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_ITEMS.map((item) => (
              <Link 
                key={item.id}
                to={`/auctions/${item.id}`}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-w-3 aspect-h-2">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Current Bid: <span className="font-semibold text-amber-800">${item.currentBid}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      <Clock className="mr-1 inline-block h-4 w-4" />
                      {new Date(item.endTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-amber-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                to={`/auctions?category=${category.name.toLowerCase()}`}
                className="flex flex-col items-center space-y-2 rounded-lg bg-white p-6 text-center shadow-sm transition-colors hover:bg-amber-100"
              >
                <span className="text-4xl">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-6 text-center">
              <Clock className="mx-auto h-12 w-12 text-amber-800" />
              <h3 className="mt-4 font-serif text-xl font-semibold">Real-time Bidding</h3>
              <p className="mt-2 text-gray-600">
                Participate in live auctions with real-time updates and notifications.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6 text-center">
              <Shield className="mx-auto h-12 w-12 text-amber-800" />
              <h3 className="mt-4 font-serif text-xl font-semibold">Secure Transactions</h3>
              <p className="mt-2 text-gray-600">
                Every transaction is protected with bank-grade security measures.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6 text-center">
              <Award className="mx-auto h-12 w-12 text-amber-800" />
              <h3 className="mt-4 font-serif text-xl font-semibold">Expert Verification</h3>
              <p className="mt-2 text-gray-600">
                All items are verified by our team of antique experts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
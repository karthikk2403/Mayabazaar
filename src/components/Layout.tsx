import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, User, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuthStore } from '@/lib/store';
import { pageTransition } from '@/lib/utils';

export function Layout() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FAF3E3]">
      <header className="sticky top-0 z-50 border-b border-amber-900/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 20 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Gavel className="h-8 w-8 text-amber-800" />
                </motion.div>
                <span className="text-2xl font-serif font-bold text-amber-900">MayaBazaar</span>
              </Link>
              <nav className="ml-10 space-x-4">
                <Link to="/auctions" className="text-gray-700 hover:text-amber-800 transition-colors">Auctions</Link>
                <Link to="/sell" className="text-gray-700 hover:text-amber-800 transition-colors">Sell</Link>
                <Link to="/about" className="text-gray-700 hover:text-amber-800 transition-colors">About</Link>
                <Link to="/contact" className="text-gray-700 hover:text-amber-800 transition-colors">Contact</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <Button variant="secondary">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransition}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="bg-amber-900 text-amber-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold">About MayaBazaar</h3>
              <p className="mt-4 text-sm text-amber-200">
                Reviving the glory of the past through carefully curated antiques and artifacts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>Email: info@mayabazaar.com</li>
                <li>Phone: +91 8309790949</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="mt-4 flex space-x-4">
                {/* Social media links */}
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-amber-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} MayaBazaar. All rights reserved by J Mohan Karthikeya.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
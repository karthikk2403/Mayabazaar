import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  interests?: string;
}

interface Bid {
  id: string;
  productId: string;
  amount: number;
  timestamp: Date;
  product: {
    title: string;
    image_url: string;
    seller: string;
    end_time: Date;
    status: 'ongoing' | 'completed';
    winner?: string;
    starting_bid: number;
    current_bid: number;
  };
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  bids: Bid[];
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  addBid: (bid: Bid) => void;
  updateProfile: (profile: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      bids: [],
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, bids: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      addBid: (bid) => set((state) => ({ bids: [bid, ...state.bids] })),
      updateProfile: (profile) => set((state) => ({
        user: state.user ? { ...state.user, ...profile } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
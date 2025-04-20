import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  reviews?: Review[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;
}

const API_URL = 'http://localhost:5000/api';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      set({ products: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`${API_URL}/products/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch product');
      }
      
      set({ currentProduct: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        isLoading: false,
      });
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch featured products');
      }
      
      // For simplicity, just take the first 5 products as featured
      const featured = data.slice(0, 5);
      set({ featuredProducts: featured, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch featured products',
        isLoading: false,
      });
    }
  },

  searchProducts: async (query) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`${API_URL}/products?search=${query}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search products');
      }
      
      set({ products: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search products',
        isLoading: false,
      });
    }
  },

  addReview: async (productId, rating, comment) => {
    try {
      set({ isLoading: true, error: null });
      
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add review');
      }
      
      // Refresh product details to include the new review
      await get().fetchProductById(productId);
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add review',
        isLoading: false,
      });
    }
  },
}));

// Import at the top of the file
import { useAuthStore } from './authStore';
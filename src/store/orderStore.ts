import { create } from 'zustand';
import { useCartStore } from './cartStore';
import { useAuthStore } from './authStore';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  createOrder: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
}

const API_URL = 'http://localhost:5000/api';

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { token } = useAuthStore.getState();
      const { items, clearCart } = useCartStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      if (items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: orderItems }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
      
      // Clear the cart after successful order
      clearCart();
      
      set({ currentOrder: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create order',
        isLoading: false,
      });
    }
  },

  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      set({ orders: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order');
      }
      
      set({ currentOrder: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch order',
        isLoading: false,
      });
    }
  },

  cancelOrder: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }
      
      // Update orders list
      await get().fetchOrders();
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel order',
        isLoading: false,
      });
    }
  },
}));
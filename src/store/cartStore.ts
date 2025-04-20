import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  }, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (product, quantity) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);
        
        let updatedItems;
        
        if (existingItem) {
          updatedItems = items.map(item => 
            item.productId === product.id 
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
        } else {
          const newItem: CartItem = {
            id: Date.now().toString(),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
          };
          updatedItems = [...items, newItem];
        }
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items: updatedItems, totalItems, totalPrice });
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.productId !== productId);
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items: updatedItems, totalItems, totalPrice });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        
        if (quantity <= 0) {
          return get().removeItem(productId);
        }
        
        const updatedItems = items.map(item => 
          item.productId === productId ? { ...item, quantity } : item
        );
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items: updatedItems, totalItems, totalPrice });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
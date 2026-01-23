import { create } from 'zustand';
import api from '@/lib/api';

interface CartItem {
  cartId?: number;           // ← new: primary key from carts table
  cakeId: number;
  quantity: number;
  name?: string;
  price?: number | string;
  images?: string[];
}

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'cartId'>) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number) => Promise<void>;     // ← change to cartId
  removeItem: (cartId: number) => Promise<void>;                         // ← change to cartId
  loadCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

// ────────────────────────────────────────────────
// Pure helper – calculates total safely
// ────────────────────────────────────────────────
const calculateTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => {
    const price = Number(item.price || 0);
    return sum + price * item.quantity;
  }, 0);

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,

  loadCart: async () => {
    const token = localStorage.getItem('token');
    set({ isLoading: true });

    try {
      if (token) {
        // Logged-in → server
        const { data } = await api.get('/cart');
        const items = (data.items || []).map((backendItem: any) => ({
          cartId: backendItem.cart_id,     // ← important!
          cakeId: backendItem.cake_id,
          quantity: backendItem.quantity,
          name: backendItem.name,
          price: backendItem.price,
          images: backendItem.images || [],
        }));
        const total = calculateTotal(items);

        set({
          items,
          total,
          isLoading: false,
        });

        // Optional backup to localStorage
        localStorage.setItem('cart', JSON.stringify(items));
      } else {
        // Guest → localStorage
        const saved = localStorage.getItem('cart');
        if (saved) {
          let items: CartItem[] = [];
          try {
            items = JSON.parse(saved);
          } catch (e) {
            console.warn('Invalid cart data in localStorage', e);
            localStorage.removeItem('cart');
          }

          const total = calculateTotal(items);
          set({ items, total, isLoading: false });
        } else {
          set({ items: [], total: 0, isLoading: false });
        }
      }
    } catch (err: any) {
      console.error('Failed to load cart:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        console.warn('Session expired → treating as guest');
        await get().loadCart(); // retry as guest
      }

      set({ isLoading: false });
    }
  },

  addItem: async (newItem: Omit<CartItem, 'cartId'>) => {
    const token = localStorage.getItem('token');
    set({ isLoading: true });

    try {
      if (token) {
        const { data } = await api.post('/cart', {
          cakeId: newItem.cakeId,
          quantity: newItem.quantity || 1,
        });
        // Backend returns updated cart → use it directly
        const items = (data.cart?.items || []).map((i: any) => ({
          cartId: i.cart_id,
          cakeId: i.cake_id,
          quantity: i.quantity,
          name: i.name,
          price: i.price,
          images: i.images || [],
        }));

        set({
          items,
          total: calculateTotal(items),
          isLoading: false,
        });

        localStorage.setItem('cart', JSON.stringify(items));
      } else {
        // Guest mode – merge if exists
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.cakeId === newItem.cakeId
          );

          let updatedItems: CartItem[];

          if (existingIndex !== -1) {
            updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity:
                updatedItems[existingIndex].quantity + (newItem.quantity || 1),
            };
          } else {
            updatedItems = [
              ...state.items,
              { ...newItem, quantity: newItem.quantity || 1 },
            ];
          }

          const total = calculateTotal(updatedItems);
          localStorage.setItem('cart', JSON.stringify(updatedItems));

          return { items: updatedItems, total, isLoading: false };
        });
      }
    } catch (err) {
      console.error('Failed to add item:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (cartId: number, quantity: number) => {
    if (quantity < 1) return;

    const token = localStorage.getItem('token');
    set({ isLoading: true });

    try {
      if (token) {
        await api.put(`/cart/${cartId}`, { quantity });
        await get().loadCart();
      } else {
        set((state) => {
          const updated = state.items
            .map((i) =>
              i.cartId === cartId ? { ...i, quantity } : i
            )
            .filter((i) => i.quantity > 0);

          const total = calculateTotal(updated);
          localStorage.setItem('cart', JSON.stringify(updated));

          return { items: updated, total, isLoading: false };
        });
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      set({ isLoading: false });
    }
  },

  removeItem: async (cartId: number) => {
    const token = localStorage.getItem('token');
    set({ isLoading: true });

    try {
      if (token) {
        // Most APIs use DELETE for removal
        await api.delete(`/cart/${cartId}`);
        await get().loadCart();
      } else {
        set((state) => {
          const updated = state.items.filter((i) => i.cartId !== cartId);
          const total = calculateTotal(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
          return { items: updated, total, isLoading: false };
        });
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await api.delete('/cart'); // clear whole cart – adjust if your API is different
      } catch (err) {
        console.error('Failed to clear server cart:', err);
      }
    }

    localStorage.removeItem('cart');
    set({ items: [], total: 0, isLoading: false });
  },
}));
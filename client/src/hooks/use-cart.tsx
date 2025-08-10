import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem, Coupon } from "@shared/schema";

interface CartState {
  cart: (CartItem & { product: Product })[];
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      appliedCoupon: null,
      
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          const newItem: CartItem & { product: Product } = {
            id: `cart-${Date.now()}`,
            productId: product.id,
            quantity,
            sessionId: "default",
            product
          };
          
          set({ cart: [...cart, newItem] });
        }
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        
        set({
          cart: get().cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        });
      },
      
      removeFromCart: (id) => {
        set({
          cart: get().cart.filter(item => item.id !== id)
        });
      },
      
      clearCart: () => {
        set({ cart: [], appliedCoupon: null });
      },
      
      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },
      
      removeCoupon: () => {
        set({ appliedCoupon: null });
      }
    }),
    {
      name: "floravista-cart",
    }
  )
);

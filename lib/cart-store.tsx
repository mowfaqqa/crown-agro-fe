"use client";

import type { CartItem, Product } from "@/lib/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "zd-crown-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hasHydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addItem(product) {
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      updateQuantity(productId, quantity) {
        setItems((current) =>
          current
            .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      clear() {
        setItems([]);
      },
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

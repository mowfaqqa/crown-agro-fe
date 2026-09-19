"use client";

import type { CartItem, Product } from "@/lib/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";

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

export function unitPriceFor(product: Product, quantity: number) {
  return product.bulkPricing.reduce(
    (price, tier) => (quantity >= tier.minQuantity ? tier.unitPrice : price),
    product.price
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { customer, ready } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hydratedCustomerId, setHydratedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    setHasHydrated(false);
    setHydratedCustomerId(null);
    window.localStorage.removeItem(CART_STORAGE_KEY);
    if (!customer) {
      setItems([]);
      setHasHydrated(true);
      return;
    }
    try {
      const stored = window.localStorage.getItem(`${CART_STORAGE_KEY}:${customer.id}`);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
      else setItems([]);
    } catch {
      window.localStorage.removeItem(`${CART_STORAGE_KEY}:${customer.id}`);
      setItems([]);
    } finally {
      setHydratedCustomerId(customer.id);
      setHasHydrated(true);
    }
  }, [customer, ready]);

  useEffect(() => {
    if (!hasHydrated || !customer || hydratedCustomerId !== customer.id) return;
    window.localStorage.setItem(`${CART_STORAGE_KEY}:${customer.id}`, JSON.stringify(items));
  }, [customer, hasHydrated, hydratedCustomerId, items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addItem(product) {
        if (!customer || product.stockQuantity < 1) return;
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQuantity) }
                : item
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      updateQuantity(productId, quantity) {
        setItems((current) =>
          current
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.min(quantity, item.product.stockQuantity) }
                : item
            )
            .filter((item) => item.quantity > 0)
        );
      },
      clear() {
        setItems([]);
      },
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + unitPriceFor(item.product, item.quantity) * item.quantity, 0)
    };
  }, [customer, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

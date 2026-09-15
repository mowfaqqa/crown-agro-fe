import type { DashboardStats, OrderPayload, Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  products: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category && category !== "All") params.set("category", category);
    const query = params.toString();
    return request<Product[]>(`/products${query ? `?${query}` : ""}`);
  },
  createOrder: (payload: OrderPayload) =>
    request<{ id: string; orderNumber: string }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  subscribe: (email: string) =>
    request<{ ok: boolean }>("/newsletter", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  adminLogin: (email: string, password: string) =>
    request<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  adminStats: (token: string) =>
    request<DashboardStats>("/admin/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
};

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

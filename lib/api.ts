import type { AdminOrder, AdminProduct, DashboardStats, OrderPayload, OrderStatus, Product } from "@/lib/types";

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
    }),
  adminProducts: (token: string) =>
    request<AdminProduct[]>("/admin/products", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  createAdminProduct: (token: string, payload: AdminProductFormPayload) =>
    request<AdminProduct>("/admin/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  updateAdminProduct: (token: string, id: string, payload: AdminProductFormPayload) =>
    request<AdminProduct>(`/admin/products/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  deleteAdminProduct: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }),
  adminOrders: (token: string) =>
    request<AdminOrder[]>("/admin/orders", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateOrderStatus: (token: string, id: string, status: OrderStatus) =>
    request<AdminOrder>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
};

export type AdminProductFormPayload = Omit<AdminProduct, "id" | "currency">;

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

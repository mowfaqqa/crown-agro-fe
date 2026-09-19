import type { AdminOrder, AdminProduct, Customer, CustomerSession, DashboardStats, OrderConfirmation, OrderDetails, OrderPayload, OrderStatus, Product, ProductFilters, ProductResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(". ") : body?.message;
    throw new ApiError(message || `Request failed with ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  products: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category && filters.category !== "All") params.set("category", filters.category);
    if (filters.country) params.set("country", filters.country);
    if (filters.halal) params.set("halal", "true");
    if (filters.exportCertified) params.set("exportCertified", "true");
    if (filters.availability && filters.availability !== "all") params.set("availability", filters.availability);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    return request<ProductResponse>(`/products${query ? `?${query}` : ""}`);
  },
  productBySlug: (slug: string) => request<Product>(`/products/${slug}`),
  createOrder: (token: string, payload: OrderPayload) =>
    request<OrderConfirmation>("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  registerCustomer: (name: string, email: string, password: string) =>
    request<CustomerSession>("/auth/customer/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    }),
  loginCustomer: (email: string, password: string) =>
    request<CustomerSession>("/auth/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  customerProfile: (token: string) =>
    request<Customer>("/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  lookupOrder: (orderNumber: string, email: string) => {
    const params = new URLSearchParams({ orderNumber, email });
    return request<OrderDetails>(`/orders/lookup?${params.toString()}`);
  },
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
  archiveAdminProduct: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin/products/${id}/archive`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    }),
  unarchiveAdminProduct: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin/products/${id}/unarchive`, {
      method: "PATCH",
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
    }),
  updateOrderNotes: (token: string, id: string, fulfillmentNotes: string) =>
    request<AdminOrder>(`/admin/orders/${id}/notes`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fulfillmentNotes })
    })
};

export type AdminProductFormPayload = Omit<AdminProduct, "id" | "currency" | "archivedAt">;

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

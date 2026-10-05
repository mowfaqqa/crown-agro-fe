import type { AdminOrder, AdminProduct, Customer, CustomerInvestmentInterest, CustomerServiceEnquiry, CustomerSession, DashboardStats, InvestmentCategory, InvestmentInterest, InvestmentInterestStatus, InvestmentOpportunity, InvestmentsResponse, InvestorType, MarketInsight, MarketIntelligenceResponse, MarketInsightType, OrderConfirmation, OrderDetails, OrderPayload, OrderStatus, Product, ProductFilters, ProductResponse, ServiceCategory, ServiceEnquiry, ServiceEnquiryStatus, ServiceListing, ServicesResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers
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
  marketIntelligence: (filters: { type?: MarketInsightType; search?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.search) params.set("search", filters.search);
    const query = params.toString();
    return request<MarketIntelligenceResponse>(`/market-intelligence${query ? `?${query}` : ""}`);
  },
  marketInsightBySlug: (slug: string) => request<MarketInsight>(`/market-intelligence/${slug}`),
  services: (filters: { category?: ServiceCategory; search?: string; location?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    const query = params.toString();
    return request<ServicesResponse>(`/services${query ? `?${query}` : ""}`);
  },
  serviceBySlug: (slug: string) => request<ServiceListing>(`/services/${slug}`),
  createServiceEnquiry: (token: string, serviceId: string, payload: { phone: string; message: string }) =>
    request<{ id: string; status: ServiceEnquiryStatus; createdAt: string }>(`/services/${serviceId}/enquiries`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  investments: (filters: { category?: InvestmentCategory; search?: string; location?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    const query = params.toString();
    return request<InvestmentsResponse>(`/investments${query ? `?${query}` : ""}`);
  },
  investmentBySlug: (slug: string) => request<InvestmentOpportunity>(`/investments/${slug}`),
  expressInvestmentInterest: (token: string, opportunityId: string, payload: { investorType: InvestorType; organizationName?: string; phone: string; indicativeAmount?: number; message: string }) =>
    request<{ id: string; status: InvestmentInterestStatus; createdAt: string }>(`/investments/${opportunityId}/interests`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  createOrder: (token: string, payload: OrderPayload) =>
    request<OrderConfirmation>("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  initializeOrderPayment: (token: string, orderId: string) =>
    request<{ authorizationUrl: string; reference: string }>(`/orders/${orderId}/payment/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }),
  verifyOrderPayment: (token: string, orderId: string, reference: string) =>
    request<{ id: string; orderNumber: string; status: OrderStatus; paidAt?: string | null }>(`/orders/${orderId}/payment/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reference })
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
  refreshCustomer: () =>
    request<CustomerSession>("/auth/customer/refresh", { method: "POST" }),
  logoutCustomer: () =>
    request<{ ok: boolean }>("/auth/customer/logout", { method: "POST" }),
  verifyEmail: (token: string) =>
    request<{ ok: boolean }>("/auth/customer/verify-email", {
      method: "POST",
      body: JSON.stringify({ token })
    }),
  resendVerification: (token: string) =>
    request<{ ok: boolean }>("/auth/customer/resend-verification", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/auth/customer/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  resetPassword: (token: string, password: string) =>
    request<{ ok: boolean }>("/auth/customer/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password })
    }),
  authProviders: () => request<{ google: boolean }>("/auth/customer/providers"),
  googleLoginUrl: () => `${API_URL}/auth/google`,
  updateCustomerProfile: (token: string, name: string) =>
    request<Customer>("/customers/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name })
    }),
  customerOrders: (token: string) =>
    request<OrderDetails[]>("/customers/me/orders", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  customerServiceEnquiries: (token: string) =>
    request<CustomerServiceEnquiry[]>("/customers/me/service-enquiries", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  customerInvestmentInterests: (token: string) =>
    request<CustomerInvestmentInterest[]>("/customers/me/investment-interests", {
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
  uploadAdminImage: (token: string, scope: "products" | "services" | "opportunities", file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ key: string; url: string }>(`/admin/uploads/images/${scope}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body
    });
  },
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
  adminMarketIntelligence: (token: string) =>
    request<MarketInsight[]>("/admin/market-intelligence", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  createAdminMarketInsight: (token: string, payload: AdminMarketInsightFormPayload) =>
    request<MarketInsight>("/admin/market-intelligence", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  updateAdminMarketInsight: (token: string, id: string, payload: AdminMarketInsightFormPayload) =>
    request<MarketInsight>(`/admin/market-intelligence/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  setAdminMarketInsightArchived: (token: string, id: string, archived: boolean) =>
    request<{ ok: boolean }>(`/admin/market-intelligence/${id}/${archived ? "archive" : "unarchive"}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    }),
  adminServices: (token: string) =>
    request<ServiceListing[]>("/admin/services", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  createAdminService: (token: string, payload: AdminServiceFormPayload) =>
    request<ServiceListing>("/admin/services", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  updateAdminService: (token: string, id: string, payload: AdminServiceFormPayload) =>
    request<ServiceListing>(`/admin/services/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  setAdminServiceArchived: (token: string, id: string, archived: boolean) =>
    request<{ ok: boolean }>(`/admin/services/${id}/${archived ? "archive" : "unarchive"}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    }),
  adminServiceEnquiries: (token: string) =>
    request<ServiceEnquiry[]>("/admin/service-enquiries", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateAdminServiceEnquiry: (token: string, id: string, status: ServiceEnquiryStatus, adminNotes: string) =>
    request<ServiceEnquiry>(`/admin/service-enquiries/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, adminNotes })
    }),
  adminInvestments: (token: string) =>
    request<InvestmentOpportunity[]>("/admin/investments", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  createAdminInvestment: (token: string, payload: AdminInvestmentFormPayload) =>
    request<InvestmentOpportunity>("/admin/investments", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  updateAdminInvestment: (token: string, id: string, payload: AdminInvestmentFormPayload) =>
    request<InvestmentOpportunity>(`/admin/investments/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    }),
  setAdminInvestmentArchived: (token: string, id: string, archived: boolean) =>
    request<{ ok: boolean }>(`/admin/investments/${id}/${archived ? "archive" : "unarchive"}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    }),
  adminInvestmentInterests: (token: string) =>
    request<InvestmentInterest[]>("/admin/investment-interests", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateAdminInvestmentInterest: (token: string, id: string, status: InvestmentInterestStatus, adminNotes: string) =>
    request<InvestmentInterest>(`/admin/investment-interests/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, adminNotes })
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
export type AdminMarketInsightFormPayload = Omit<MarketInsight, "id" | "publishedAt" | "archivedAt" | "createdAt" | "updatedAt"> & { published: boolean };
export type AdminServiceFormPayload = Omit<ServiceListing, "id" | "publishedAt" | "archivedAt" | "createdAt" | "updatedAt" | "_count"> & { published: boolean };
export type AdminInvestmentFormPayload = Omit<InvestmentOpportunity, "id" | "publishedAt" | "archivedAt" | "createdAt" | "updatedAt" | "_count"> & { published: boolean };

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

export type Category =
  | "Fruits"
  | "Grains"
  | "Vegetables"
  | "Livestock"
  | "Poultry"
  | "Fish"
  | "Equipment"
  | "Processed Foods";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: "NGN";
  category: Category;
  countryOfOrigin: string;
  sellerName: string;
  stockQuantity: number;
  unit: string;
  imageUrl: string;
  halalCertified: boolean;
  exportCertified: boolean;
  bulkPricing: {
    minQuantity: number;
    unitPrice: number;
  }[];
  featured: boolean;
  archivedAt?: string | null;
};

export type ProductSort = "featured" | "newest" | "price_asc" | "price_desc" | "name_asc";
export type AvailabilityFilter = "all" | "in_stock" | "out_of_stock";

export type ProductFilters = {
  search?: string;
  category?: string;
  country?: string;
  halal?: boolean;
  exportCertified?: boolean;
  availability?: AvailabilityFilter;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

export type ProductResponse = {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: { countries: string[] };
};

export type Customer = { id: string; name: string; email: string; emailVerified: boolean };

export type CustomerSession = {
  accessToken: string;
  customer: Customer;
};

export type AdminProduct = Omit<Product, "category" | "sellerName" | "bulkPricing"> & {
  category:
    | "FRUITS"
    | "GRAINS"
    | "VEGETABLES"
    | "LIVESTOCK"
    | "POULTRY"
    | "FISH"
    | "EQUIPMENT"
    | "PROCESSED_FOODS";
  sellerName: string;
  sellerCountry: string;
  bulkPricing: {
    minQuantity: number;
    unitPrice: number;
  }[];
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "AWAITING_PAYMENT" | "PAID" | "FULFILLED" | "CANCELLED";

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryCountry: string;
  deliveryAddress: string;
  notes?: string | null;
  fulfillmentNotes?: string | null;
  status: OrderStatus;
  paymentProvider?: string | null;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  paidAt?: string | null;
  subtotal: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
      unit: string;
      imageUrl: string;
    };
  }[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type DashboardStats = {
  products: number;
  orders: number;
  pendingOrders: number;
  newServiceEnquiries: number;
  newInvestmentInterests: number;
  lowStock: number;
  revenue: number;
};

export type OrderPayload = {
  idempotencyKey: string;
  phone: string;
  deliveryCountry: string;
  deliveryAddress: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

export type OrderConfirmation = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
};

export type OrderDetails = AdminOrder;

export type MarketInsightType = "COMMODITY_PRICE" | "AGRICULTURE_NEWS" | "EXPORT_OPPORTUNITY" | "WEATHER_ADVISORY";

export type MarketInsight = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: MarketInsightType;
  imageUrl?: string | null;
  location?: string | null;
  commodity?: string | null;
  dataValue?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  featured: boolean;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketIntelligenceResponse = {
  items: MarketInsight[];
  counts: Partial<Record<MarketInsightType, number>>;
};

export type ServiceCategory =
  | "EQUIPMENT_RENTAL"
  | "JOB_BOARD"
  | "TRAINING"
  | "EXPORT_LOGISTICS"
  | "INPUT_SUPPLY"
  | "WAREHOUSING"
  | "SMART_FARMING"
  | "COMMUNITY";

export type ServiceListing = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: ServiceCategory;
  providerName: string;
  location?: string | null;
  imageUrl?: string | null;
  featured: boolean;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { enquiries: number };
};

export type ServicesResponse = {
  items: ServiceListing[];
  counts: Partial<Record<ServiceCategory, number>>;
  locations: string[];
};

export type ServiceEnquiryStatus = "NEW" | "IN_REVIEW" | "CONTACTED" | "CLOSED";

export type ServiceEnquiry = {
  id: string;
  phone: string;
  message: string;
  status: ServiceEnquiryStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  service: Pick<ServiceListing, "id" | "title" | "slug" | "category">;
  customer: Pick<Customer, "id" | "name" | "email">;
};

export type CustomerServiceEnquiry = Omit<ServiceEnquiry, "adminNotes" | "customer" | "service"> & {
  service: Pick<ServiceListing, "id" | "title" | "slug" | "providerName" | "location">;
};

export type InvestmentCategory =
  | "FARMING_SEASON"
  | "FRESH_PRODUCE"
  | "GRAINS"
  | "LIVESTOCK"
  | "EXPORT_LOGISTICS"
  | "WAREHOUSING"
  | "PROCESSING";

export type InvestmentOpportunity = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: InvestmentCategory;
  location?: string | null;
  imageUrl?: string | null;
  fundingTarget?: number | null;
  minimumInterestAmount?: number | null;
  durationMonths?: number | null;
  riskSummary: string;
  featured: boolean;
  openForInterest: boolean;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { interests: number };
};

export type InvestmentsResponse = {
  items: InvestmentOpportunity[];
  counts: Partial<Record<InvestmentCategory, number>>;
  locations: string[];
};

export type InvestorType = "INDIVIDUAL" | "BUSINESS" | "INSTITUTION" | "NGO" | "GOVERNMENT";
export type InvestmentInterestStatus = "NEW" | "IN_REVIEW" | "CONTACTED" | "CLOSED";

export type InvestmentInterest = {
  id: string;
  investorType: InvestorType;
  organizationName?: string | null;
  phone: string;
  indicativeAmount?: number | null;
  message: string;
  status: InvestmentInterestStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: Pick<InvestmentOpportunity, "id" | "title" | "slug" | "category">;
  customer: Pick<Customer, "id" | "name" | "email">;
};

export type CustomerInvestmentInterest = Omit<InvestmentInterest, "adminNotes" | "customer" | "opportunity"> & {
  opportunity: Pick<InvestmentOpportunity, "id" | "title" | "slug" | "location">;
};

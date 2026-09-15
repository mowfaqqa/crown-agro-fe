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
  status: OrderStatus;
  subtotal: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
      unit: string;
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
  lowStock: number;
  revenue: number;
};

export type OrderPayload = {
  customerName: string;
  email: string;
  phone: string;
  deliveryCountry: string;
  deliveryAddress: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

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

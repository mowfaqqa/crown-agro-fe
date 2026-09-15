import type { Product } from "@/lib/types";

export const fallbackProducts: Product[] = [
  {
    id: "apricots",
    name: "Fresh Apricots",
    slug: "fresh-apricots",
    description: "Carton-packed apricots from verified ZD Crown orchards.",
    price: 9000,
    compareAtPrice: 11000,
    currency: "NGN",
    category: "Fruits",
    countryOfOrigin: "Nigeria",
    sellerName: "ZD Crown Orchards",
    stockQuantity: 140,
    unit: "Carton",
    imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
    halalCertified: true,
    exportCertified: true,
    bulkPricing: [
      { minQuantity: 20, unitPrice: 8400 },
      { minQuantity: 50, unitPrice: 7900 }
    ],
    featured: true
  },
  {
    id: "dates",
    name: "Fresh Dates Premium",
    slug: "fresh-dates-premium",
    description: "Premium date packs for retail, wholesale, and export buyers.",
    price: 12000,
    compareAtPrice: 13500,
    currency: "NGN",
    category: "Fruits",
    countryOfOrigin: "Nigeria",
    sellerName: "ZD Crown Orchards",
    stockQuantity: 90,
    unit: "Crate",
    imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=900&q=80",
    halalCertified: true,
    exportCertified: true,
    bulkPricing: [
      { minQuantity: 15, unitPrice: 11200 },
      { minQuantity: 40, unitPrice: 10600 }
    ],
    featured: true
  },
  {
    id: "cashew-apple",
    name: "Fresh Cashew Apple",
    slug: "fresh-cashew-apple",
    description: "Fresh cashew apples sourced from farmer clusters in West Africa.",
    price: 3500,
    currency: "NGN",
    category: "Fruits",
    countryOfOrigin: "Ghana",
    sellerName: "Akan Agro Cooperative",
    stockQuantity: 210,
    unit: "Bag",
    imageUrl: "https://images.unsplash.com/photo-1621955559809-e93b8e576bf5?auto=format&fit=crop&w=900&q=80",
    halalCertified: true,
    exportCertified: false,
    bulkPricing: [
      { minQuantity: 30, unitPrice: 3200 },
      { minQuantity: 80, unitPrice: 2950 }
    ],
    featured: true
  },
  {
    id: "star-fruit",
    name: "Fresh Star Fruit",
    slug: "fresh-star-fruit",
    description: "Export-grade star fruit prepared for supermarkets and hotels.",
    price: 4500,
    currency: "NGN",
    category: "Fruits",
    countryOfOrigin: "Nigeria",
    sellerName: "Benue Fresh Farms",
    stockQuantity: 74,
    unit: "Bag",
    imageUrl: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=900&q=80",
    halalCertified: true,
    exportCertified: true,
    bulkPricing: [
      { minQuantity: 25, unitPrice: 4150 },
      { minQuantity: 60, unitPrice: 3825 }
    ],
    featured: true
  },
  {
    id: "sesame",
    name: "White Sesame Seeds",
    slug: "white-sesame-seeds",
    description: "Cleaned sesame seeds available for local supply and export.",
    price: 6500,
    currency: "NGN",
    category: "Grains",
    countryOfOrigin: "Nigeria",
    sellerName: "Kano Grain Merchants",
    stockQuantity: 420,
    unit: "Bag",
    imageUrl: "https://images.unsplash.com/photo-1629123742946-4a2101921f10?auto=format&fit=crop&w=900&q=80",
    halalCertified: true,
    exportCertified: true,
    bulkPricing: [
      { minQuantity: 50, unitPrice: 6100 },
      { minQuantity: 120, unitPrice: 5750 }
    ],
    featured: false
  },
  {
    id: "cantaloupe",
    name: "Fresh Cantaloupe",
    slug: "fresh-cantaloupe",
    description: "Sweet cantaloupe harvested on demand for freshness.",
    price: 3500,
    currency: "NGN",
    category: "Fruits",
    countryOfOrigin: "Nigeria",
    sellerName: "Plateau Valley Farms",
    stockQuantity: 58,
    unit: "Whole",
    imageUrl: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=900&q=80",
    halalCertified: true,
    exportCertified: false,
    bulkPricing: [
      { minQuantity: 25, unitPrice: 3200 },
      { minQuantity: 70, unitPrice: 3000 }
    ],
    featured: false
  }
];

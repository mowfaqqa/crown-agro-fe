"use client";

import { CheckCircle2, PackageCheck, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { customer } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function addToCart() {
    if (!customer) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    addItem(product);
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-forest-100 bg-white shadow-line transition duration-200 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-50">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.exportCertified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-semibold text-forest-800">
              <PackageCheck size={14} aria-hidden="true" /> Export
            </span>
          ) : null}
          {product.halalCertified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-harvest-100 px-2.5 py-1 text-xs font-semibold text-forest-900">
              <CheckCircle2 size={14} aria-hidden="true" /> Halal
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">{product.category}</p>
          <h3 className="mt-1 text-lg font-extrabold text-forest-950">
            <Link href={`/products/${product.slug}`} className="transition hover:text-forest-700">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 min-h-10 text-sm leading-6 text-slate-600">{product.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Seller</p>
            <p className="font-semibold text-forest-900">{product.sellerName}</p>
          </div>
          <div>
            <p className="text-slate-500">Origin</p>
            <p className="font-semibold text-forest-900">{product.countryOfOrigin}</p>
          </div>
          <div>
            <p className="text-slate-500">Stock</p>
            <p className="font-semibold text-forest-900">
              {product.stockQuantity} {product.unit}s
            </p>
          </div>
          <div>
            <p className="text-slate-500">Bulk from</p>
            <p className="font-semibold text-forest-900">
              {product.bulkPricing[0]?.minQuantity ?? 1} {product.unit}s
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xl font-extrabold tabular-nums text-forest-950">{formatNaira(product.price)}</p>
            <p className="text-xs text-slate-500">per {product.unit}</p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={product.stockQuantity < 1}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-forest-600 px-4 text-sm font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={18} aria-hidden="true" /> {product.stockQuantity < 1 ? "Sold out" : customer ? "Add" : "Sign in"}
          </button>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-forest-100 text-sm font-bold text-forest-800 transition hover:bg-forest-50"
        >
          View product details
        </Link>
      </div>
    </article>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, CheckCircle2, PackageCheck, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { api, formatNaira } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { customer } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const productQuery = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => api.productBySlug(params.slug),
    retry: 1
  });
  const product = productQuery.data;
  const relatedQuery = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: () => api.products({ category: product?.category, limit: 4 }),
    enabled: Boolean(product)
  });
  const related = (relatedQuery.data?.items ?? []).filter((item) => item.slug !== params.slug).slice(0, 3);

  function addToCart() {
    if (!customer) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (product) addItem(product);
  }

  if (productQuery.isLoading) return <main><SiteHeader /><div className="mx-auto min-h-[65vh] max-w-7xl animate-pulse px-4 py-12"><div className="h-[560px] rounded-lg bg-forest-50" /></div></main>;

  if (productQuery.isError) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center"><div><h1 className="text-3xl font-black text-forest-950">Product service unavailable</h1><p className="mt-3 text-slate-600">We could not load this product. Check your connection and try again.</p><button type="button" onClick={() => productQuery.refetch()} className="mt-6 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Try again</button></div></section></main>;

  if (!product) {
    return (
      <main>
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-forest-950">Product not found</h1>
          <p className="mt-3 text-slate-600">This product may be unavailable or unpublished.</p>
          <Link href="/marketplace" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">
            Back to marketplace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-bold text-forest-800">
          <ArrowLeft size={17} aria-hidden="true" /> Back to marketplace
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-forest-100 bg-white shadow-line">
            <div className="relative aspect-[4/3] bg-forest-50">
              <Image src={product.imageUrl} alt={product.name} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          </div>

          <aside className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <div className="flex flex-wrap gap-2">
              {product.exportCertified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 text-sm font-black text-forest-800">
                  <PackageCheck size={16} aria-hidden="true" /> Export certified
                </span>
              ) : null}
              {product.halalCertified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-harvest-100 px-3 py-1 text-sm font-black text-forest-950">
                  <CheckCircle2 size={16} aria-hidden="true" /> Halal certified
                </span>
              ) : null}
            </div>
            <p className="mt-5 text-sm font-bold uppercase text-forest-600">{product.category}</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-forest-950">{product.name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{product.description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Seller", product.sellerName],
                ["Origin", product.countryOfOrigin],
                ["Available stock", `${product.stockQuantity} ${product.unit}s`],
                ["Unit", product.unit]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-forest-50 p-4">
                  <p className="text-sm font-bold text-slate-500">{label}</p>
                  <p className="mt-1 font-black text-forest-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <span className="font-black text-forest-950">Bulk pricing</span>
                <span className="text-sm font-bold text-slate-500">per {product.unit}</span>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between p-4">
                  <span className="font-semibold text-slate-700">1+ {product.unit}</span>
                  <span className="font-black text-forest-950">{formatNaira(product.price)}</span>
                </div>
                {product.bulkPricing.map((price) => (
                  <div key={price.minQuantity} className="flex items-center justify-between p-4">
                    <span className="font-semibold text-slate-700">{price.minQuantity}+ {product.unit}s</span>
                    <span className="font-black text-forest-950">{formatNaira(price.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={addToCart}
                disabled={product.stockQuantity < 1}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-forest-600 px-5 font-black text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingCart size={19} aria-hidden="true" /> {product.stockQuantity < 1 ? "Out of stock" : customer ? "Add to cart" : "Sign in to add"}
              </button>
              <Link href={customer ? "/cart" : `/login?returnTo=${encodeURIComponent(pathname)}`} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-forest-200 px-5 font-black text-forest-800 transition hover:bg-forest-50">
                Review cart
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [ShieldCheck, "Verified seller", "Supplier details are visible before order request."],
            [Truck, "Logistics ready", "Delivery country and address are collected at checkout."],
            [BadgeCheck, "Certification clarity", "Halal and export flags are product-level signals."]
          ].map(([Icon, title, copy]) => (
            <article key={title as string} className="rounded-lg border border-forest-100 bg-forest-50 p-5">
              <Icon className="text-forest-600" size={24} aria-hidden="true" />
              <h2 className="mt-3 font-black text-forest-950">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p>
            </article>
          ))}
        </div>
      </section>

      {related.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-forest-950">Related products</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

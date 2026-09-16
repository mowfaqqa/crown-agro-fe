"use client";

import { useQuery } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import { fallbackProducts } from "@/lib/mock-data";

const categories = ["All", "Fruits", "Grains", "Vegetables", "Livestock", "Poultry", "Fish", "Equipment", "Processed Foods"];

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceFallback />}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceFallback() {
  return (
    <main>
      <SiteHeader />
      <section className="border-b border-forest-100 bg-forest-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase text-harvest-300">Marketplace</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Loading verified agro products</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-forest-100">Preparing filters, stock details, and seller information.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-14 rounded-lg border border-forest-100 bg-white shadow-line" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-lg bg-forest-50" />
          ))}
        </div>
      </section>
    </main>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "All";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "All");

  const productsQuery = useQuery({
    queryKey: ["products", search, category],
    queryFn: () => api.products(search, category)
  });
  const products = productsQuery.data ?? fallbackProducts;
  const featuredCount = useMemo(() => products.filter((product) => product.featured).length, [products]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <main>
      <SiteHeader />
      <section className="border-b border-forest-100 bg-forest-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase text-harvest-300">Marketplace</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">Browse verified agro products</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-forest-100">
                Search by product, seller, category, and origin. Every listing keeps stock, certification, and bulk pricing visible.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-3xl font-black">{products.length}</p>
              <p className="text-sm text-forest-100">Products available · {featuredCount} featured</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form className="grid gap-3 rounded-lg border border-forest-100 bg-white p-3 shadow-line lg:grid-cols-[1fr_auto_auto]" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="marketplace-search">Search products</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              id="marketplace-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search apricots, sesame, dates..."
              className="min-h-12 w-full rounded-md border border-slate-200 px-10 text-forest-950"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-12 rounded-md border border-slate-200 px-4 text-forest-950"
            aria-label="Product category"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest-600 px-6 font-extrabold text-white transition hover:bg-forest-700">
            <Filter size={18} aria-hidden="true" /> Apply filters
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`min-h-10 rounded-full border px-4 text-sm font-bold transition ${
                category === item ? "border-forest-600 bg-forest-600 text-white" : "border-forest-100 bg-white text-forest-900 hover:bg-forest-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!products.length ? (
          <div className="mt-10 rounded-lg border border-forest-100 bg-white p-8 text-center">
            <h2 className="text-2xl font-black text-forest-950">No products found</h2>
            <p className="mt-2 text-slate-600">Try another search or category.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

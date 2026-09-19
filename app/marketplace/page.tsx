"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, RotateCcw, Search, SlidersHorizontal, WifiOff, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import type { AvailabilityFilter, ProductFilters, ProductSort } from "@/lib/types";

const categories = ["All", "Fruits", "Grains", "Vegetables", "Livestock", "Poultry", "Fish", "Equipment", "Processed Foods"];
const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A to Z" }
];

export default function MarketplacePage() {
  return <Suspense fallback={<MarketplaceLoading />}><MarketplaceContent /></Suspense>;
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilters = useMemo<ProductFilters>(() => ({
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "All",
    country: searchParams.get("country") ?? "",
    halal: searchParams.get("halal") === "true",
    exportCertified: searchParams.get("exportCertified") === "true",
    availability: (searchParams.get("availability") as AvailabilityFilter) ?? "all",
    sort: (searchParams.get("sort") as ProductSort) ?? "featured",
    page: Number(searchParams.get("page") ?? 1),
    limit: 12
  }), [searchParams]);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
    setSearchInput(initialFilters.search ?? "");
  }, [initialFilters]);

  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: () => api.products(filters),
    placeholderData: keepPreviousData
  });
  const response = productsQuery.data;
  const products = response?.items ?? [];
  const activeFilterCount = [filters.country, filters.halal, filters.exportCertified, filters.availability !== "all"].filter(Boolean).length;

  function updateFilters(next: Partial<ProductFilters>) {
    const updated = { ...filters, ...next, page: next.page ?? 1 };
    setFilters(updated);
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "all" && key !== "limit" && !(key === "page" && value === 1)) params.set(key, String(value));
    });
    router.replace(`/marketplace${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ search: searchInput.trim() });
  }

  function resetFilters() {
    setSearchInput("");
    updateFilters({ search: "", category: "All", country: "", halal: false, exportCertified: false, availability: "all", sort: "featured" });
  }

  return (
    <main>
      <SiteHeader />
      <section className="border-b border-forest-100 bg-forest-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase text-harvest-300">Marketplace</p>
          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div><h1 className="text-4xl font-black leading-tight sm:text-5xl">Browse verified agro products</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-forest-100">Compare origin, stock, certification, and bulk pricing before adding products to your account cart.</p></div>
            <div className="border-l-2 border-harvest-300 pl-4"><p className="text-3xl font-black tabular-nums">{response?.pagination.total ?? 0}</p><p className="text-sm text-forest-100">matching products</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form className="grid gap-3 rounded-lg border border-forest-100 bg-white p-3 shadow-line md:grid-cols-[1fr_220px_auto]" onSubmit={submitSearch} role="search">
          <label className="relative"><span className="sr-only">Search products</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products or sellers" className="min-h-12 w-full rounded-md border border-slate-200 px-10 text-forest-950" /></label>
          <label><span className="sr-only">Sort products</span><select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as ProductSort })} className="min-h-12 w-full rounded-md border border-slate-200 px-3 text-forest-950">{sortOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest-600 px-6 font-extrabold text-white transition hover:bg-forest-700"><Search size={18} aria-hidden="true" /> Search</button>
        </form>

        <div className="mt-5 lg:hidden"><button type="button" onClick={() => setFiltersOpen((current) => !current)} className="flex min-h-12 w-full items-center justify-between rounded-md border border-forest-100 bg-white px-4 font-black text-forest-950" aria-expanded={filtersOpen} aria-controls="marketplace-filters"><span className="inline-flex items-center gap-2"><SlidersHorizontal size={18} aria-hidden="true" /> Filters {activeFilterCount ? `(${activeFilterCount})` : ""}</span>{filtersOpen ? <X size={18} aria-hidden="true" /> : <Filter size={18} aria-hidden="true" />}</button></div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside id="marketplace-filters" className={`${filtersOpen ? "block" : "hidden"} rounded-lg border border-forest-100 bg-white p-5 shadow-line lg:block`}>
            <div className="flex items-center justify-between"><h2 className="font-black text-forest-950">Refine results</h2><button type="button" onClick={resetFilters} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-forest-700"><RotateCcw size={15} aria-hidden="true" /> Reset</button></div>
            <div className="mt-5 space-y-5">
              <FilterSelect label="Category" value={filters.category ?? "All"} onChange={(value) => updateFilters({ category: value })} options={categories} />
              <FilterSelect label="Country of origin" value={filters.country ?? ""} onChange={(value) => updateFilters({ country: value })} options={["", ...(response?.filters.countries ?? [])]} emptyLabel="All countries" />
              <FilterSelect label="Availability" value={filters.availability ?? "all"} onChange={(value) => updateFilters({ availability: value as AvailabilityFilter })} options={["all", "in_stock", "out_of_stock"]} labels={{ all: "All stock", in_stock: "In stock", out_of_stock: "Out of stock" }} />
              <fieldset className="space-y-3"><legend className="text-sm font-black text-forest-950">Certification</legend><FilterCheckbox label="Halal certified" checked={Boolean(filters.halal)} onChange={(checked) => updateFilters({ halal: checked })} /><FilterCheckbox label="Export certified" checked={Boolean(filters.exportCertified)} onChange={(checked) => updateFilters({ exportCertified: checked })} /></fieldset>
            </div>
          </aside>

          <div aria-live="polite" aria-busy={productsQuery.isFetching}>
            {productsQuery.isLoading ? <ProductSkeletons /> : null}
            {productsQuery.isError ? <OfflineState retry={() => productsQuery.refetch()} /> : null}
            {!productsQuery.isError && !productsQuery.isLoading && products.length ? (
              <><div className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${productsQuery.isFetching ? "opacity-60" : "opacity-100"}`}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</div><Pagination page={response?.pagination.page ?? 1} totalPages={response?.pagination.totalPages ?? 1} onChange={(page) => updateFilters({ page })} /></>
            ) : null}
            {!productsQuery.isError && !productsQuery.isLoading && !products.length ? <div className="rounded-lg border border-forest-100 bg-white p-10 text-center"><Search className="mx-auto text-forest-600" size={36} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">No products match</h2><p className="mt-2 text-slate-600">Clear a filter or try a broader search.</p><button type="button" onClick={resetFilters} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Clear all filters</button></div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterSelect({ label, value, onChange, options, emptyLabel, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; emptyLabel?: string; labels?: Record<string, string> }) {
  return <label className="block text-sm font-black text-forest-950">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal">{options.map((option) => <option key={option || "all"} value={option}>{option ? labels[option] ?? option : emptyLabel}</option>)}</select></label>;
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 hover:bg-forest-50"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-forest-600" /><span className="text-sm font-semibold text-slate-700">{label}</span></label>;
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <nav className="mt-8 flex items-center justify-between border-t border-forest-100 pt-5" aria-label="Product pages"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-forest-900 disabled:opacity-40"><ChevronLeft size={18} aria-hidden="true" /> Previous</button><span className="text-sm font-bold text-slate-600">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-forest-900 disabled:opacity-40">Next <ChevronRight size={18} aria-hidden="true" /></button></nav>;
}

function MarketplaceLoading() { return <main><SiteHeader /><section className="mx-auto max-w-7xl px-4 py-12"><ProductSkeletons /></section></main>; }
function ProductSkeletons() { return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[430px] animate-pulse rounded-lg bg-forest-50" />)}</div>; }
function OfflineState({ retry }: { retry: () => void }) { return <div className="rounded-lg border border-red-100 bg-white p-10 text-center"><WifiOff className="mx-auto text-red-700" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">Marketplace is temporarily unavailable</h2><p className="mx-auto mt-2 max-w-lg text-slate-600">We could not reach the product service. Check your connection and try again.</p><button type="button" onClick={retry} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Try again</button></div>; }

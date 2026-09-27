"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Settings2, WifiOff, Wrench } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ServiceCard, serviceCategoryDetails } from "@/components/service-card";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import type { ServiceCategory } from "@/lib/types";

const categories = Object.keys(serviceCategoryDetails) as ServiceCategory[];

export default function ServicesPage() {
  return <Suspense fallback={<PageLoading />}><ServicesContent /></Suspense>;
}

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = (searchParams.get("category") as ServiceCategory | null) ?? undefined;
  const selectedLocation = searchParams.get("location") ?? "";
  const search = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const services = useQuery({
    queryKey: ["services", selectedCategory, selectedLocation, search],
    queryFn: () => api.services({ category: selectedCategory, location: selectedLocation, search }),
    retry: 1
  });

  function setFilters(category = selectedCategory, location = selectedLocation, query = search) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (query.trim()) params.set("search", query.trim());
    router.push(`/services${params.size ? `?${params.toString()}` : ""}`);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(selectedCategory, selectedLocation, searchInput);
  }

  const items = services.data?.items ?? [];
  return (
    <main>
      <SiteHeader />
      <section className="relative isolate min-h-[430px] overflow-hidden bg-forest-950 text-white">
        <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80" alt="Cultivated farmland at sunrise" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-forest-950/80" />
        <div className="mx-auto flex min-h-[430px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-harvest-300"><Wrench size={18} aria-hidden="true" /> Agricultural services directory</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Find practical support for your next agricultural project</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">Discover admin-reviewed service listings across equipment, logistics, training, inputs, warehousing, and farm technology.</p>
          <form onSubmit={submitSearch} className="mt-7 flex max-w-2xl flex-col gap-2 rounded-lg bg-white p-2 shadow-soft sm:flex-row">
            <label className="sr-only" htmlFor="service-search">Search services</label>
            <input id="service-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search services or providers" className="min-h-12 flex-1 rounded-md px-4 text-forest-950 placeholder:text-slate-500" />
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest-600 px-6 font-black text-white"><Search size={18} aria-hidden="true" /> Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-end">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter services by category">
            <button type="button" onClick={() => setFilters(undefined)} aria-pressed={!selectedCategory} className={`min-h-11 rounded-md px-4 text-sm font-black ${!selectedCategory ? "bg-forest-600 text-white" : "border border-forest-100 bg-white text-forest-800"}`}>All services</button>
            {categories.map((category) => { const { Icon, label } = serviceCategoryDetails[category]; return <button key={category} type="button" onClick={() => setFilters(category)} aria-pressed={selectedCategory === category} className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-black ${selectedCategory === category ? "bg-forest-600 text-white" : "border border-forest-100 bg-white text-forest-800"}`}><Icon size={17} aria-hidden="true" />{label}<span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">{services.data?.counts[category] ?? 0}</span></button>; })}
          </div>
          <label className="text-sm font-black text-forest-950">Location<select value={selectedLocation} onChange={(event) => setFilters(selectedCategory, event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-forest-100 bg-white px-3 font-semibold text-slate-700"><option value="">All locations</option>{services.data?.locations.map((location) => <option key={location} value={location}>{location}</option>)}</select></label>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase text-forest-600">Service directory</p><h2 className="mt-1 text-3xl font-black text-forest-950">{selectedCategory ? serviceCategoryDetails[selectedCategory].label : search ? `Results for “${search}”` : "Available services"}</h2></div><p className="text-sm font-bold text-slate-500">{items.length} {items.length === 1 ? "listing" : "listings"}</p></div>
        {services.isLoading ? <CardSkeletons /> : null}
        {services.isError ? <div className="mt-6 rounded-lg border border-red-100 bg-white p-10 text-center"><WifiOff className="mx-auto text-red-700" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">Services are temporarily unavailable</h2><p className="mt-2 text-slate-600">We could not load the directory. Please try again.</p><button type="button" onClick={() => services.refetch()} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Try again</button></div> : null}
        {!services.isLoading && !services.isError && items.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((service, index) => <ServiceCard key={service.id} service={service} priority={index < 3} />)}</div> : null}
        {!services.isLoading && !services.isError && !items.length ? <div className="mt-6 rounded-lg border border-forest-100 bg-white p-10 text-center"><Settings2 className="mx-auto text-forest-600" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">No matching services found</h2><p className="mt-2 text-slate-600">Try a broader search or clear your filters.</p><button type="button" onClick={() => { setSearchInput(""); setFilters(undefined, "", ""); }} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">View all services</button></div> : null}
      </section>

      <section className="bg-white py-12"><div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">{[["Admin reviewed", "Listings are controlled by the ZD Crown admin team before they appear publicly."], ["Direct enquiry", "Send your requirements from your verified customer account without committing to a purchase."], ["Clear follow-up", "The team records each enquiry and contacts you using the details you provide."]].map(([title, copy]) => <article key={title} className="border-l-4 border-forest-500 bg-forest-50 p-5"><h2 className="font-black text-forest-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></article>)}</div></section>
    </main>
  );
}

function PageLoading() { return <main><SiteHeader /><div className="h-[430px] animate-pulse bg-forest-900" /><section className="mx-auto max-w-7xl px-4 py-12"><CardSkeletons /></section></main>; }
function CardSkeletons() { return <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-lg bg-forest-50" />)}</div>; }

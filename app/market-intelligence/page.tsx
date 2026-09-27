"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, CloudSun, Newspaper, Search, Ship, WifiOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { MarketInsightCard, insightTypeDetails } from "@/components/market-insight-card";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import type { MarketInsightType } from "@/lib/types";

const types: MarketInsightType[] = ["COMMODITY_PRICE", "AGRICULTURE_NEWS", "EXPORT_OPPORTUNITY", "WEATHER_ADVISORY"];

export default function MarketIntelligencePage() {
  return <Suspense fallback={<PageLoading />}><MarketIntelligenceContent /></Suspense>;
}

function MarketIntelligenceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedType = (searchParams.get("type") as MarketInsightType | null) ?? undefined;
  const search = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const intelligence = useQuery({
    queryKey: ["market-intelligence", selectedType, search],
    queryFn: () => api.marketIntelligence({ type: selectedType, search }),
    retry: 1
  });

  function setFilters(type?: MarketInsightType, query = search) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (query.trim()) params.set("search", query.trim());
    router.push(`/market-intelligence${params.size ? `?${params.toString()}` : ""}`);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(selectedType, searchInput);
  }

  const items = intelligence.data?.items ?? [];

  return (
    <main>
      <SiteHeader />
      <section className="relative isolate min-h-[460px] overflow-hidden bg-forest-950 text-white">
        <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80" alt="Cultivated farmland viewed at sunrise" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-forest-950/80" />
        <div className="mx-auto flex min-h-[460px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-harvest-300"><BarChart3 size={18} aria-hidden="true" /> Admin-verified updates</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Market intelligence for better agricultural decisions</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">Follow curated commodity updates, sector news, export opportunities, and weather advisories published by the ZD Crown team.</p>
          <form onSubmit={submitSearch} className="mt-7 flex max-w-2xl flex-col gap-2 rounded-lg bg-white p-2 shadow-soft sm:flex-row">
            <label className="sr-only" htmlFor="intelligence-search">Search market intelligence</label>
            <input id="intelligence-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search commodities, locations, or topics" className="min-h-12 flex-1 rounded-md px-4 text-forest-950 placeholder:text-slate-500" />
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest-600 px-6 font-black text-white"><Search size={18} aria-hidden="true" /> Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter market intelligence">
          <button type="button" onClick={() => setFilters(undefined)} aria-pressed={!selectedType} className={`min-h-11 rounded-md px-4 text-sm font-black ${!selectedType ? "bg-forest-600 text-white" : "border border-forest-100 bg-white text-forest-800"}`}>All updates</button>
          {types.map((type) => { const { Icon, label } = insightTypeDetails[type]; return <button key={type} type="button" onClick={() => setFilters(type)} aria-pressed={selectedType === type} className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-black ${selectedType === type ? "bg-forest-600 text-white" : "border border-forest-100 bg-white text-forest-800"}`}><Icon size={17} aria-hidden="true" />{label}<span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">{intelligence.data?.counts[type] ?? 0}</span></button>; })}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase text-forest-600">Latest intelligence</p><h2 className="mt-1 text-3xl font-black text-forest-950">{selectedType ? insightTypeDetails[selectedType].label : search ? `Results for “${search}”` : "All published updates"}</h2></div><p className="text-sm font-bold text-slate-500">{items.length} {items.length === 1 ? "update" : "updates"}</p></div>

        {intelligence.isLoading ? <CardSkeletons /> : null}
        {intelligence.isError ? <div className="mt-6 rounded-lg border border-red-100 bg-white p-10 text-center"><WifiOff className="mx-auto text-red-700" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">Intelligence service is unavailable</h2><p className="mt-2 text-slate-600">We could not load the latest updates. Please try again.</p><button type="button" onClick={() => intelligence.refetch()} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Try again</button></div> : null}
        {!intelligence.isLoading && !intelligence.isError && items.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <MarketInsightCard key={item.id} insight={item} priority={index < 3} />)}</div> : null}
        {!intelligence.isLoading && !intelligence.isError && !items.length ? <div className="mt-6 rounded-lg border border-forest-100 bg-white p-10 text-center"><Search className="mx-auto text-forest-600" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">No published updates found</h2><p className="mt-2 text-slate-600">Try a broader search or return to all intelligence.</p><button type="button" onClick={() => { setSearchInput(""); setFilters(undefined, ""); }} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">View all updates</button></div> : null}
      </section>

      <section className="bg-white py-12"><div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">{[[Newspaper, "Curated by administrators", "Every public update is reviewed and deliberately published by the ZD Crown team."], [Ship, "Opportunity discovery", "Export notices provide a starting point for enquiries, not a promise of availability."], [CloudSun, "Advisory context", "Weather entries are clearly presented as admin updates rather than live forecasts."]].map(([Icon, title, copy]) => <article key={title as string} className="border-l-4 border-forest-500 bg-forest-50 p-5"><Icon className="text-forest-600" size={24} aria-hidden="true" /><h2 className="mt-3 font-black text-forest-950">{title as string}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p></article>)}</div></section>
    </main>
  );
}

function PageLoading() { return <main><SiteHeader /><div className="h-[460px] animate-pulse bg-forest-900" /><section className="mx-auto max-w-7xl px-4 py-12"><CardSkeletons /></section></main>; }
function CardSkeletons() { return <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-lg bg-forest-50" />)}</div>; }

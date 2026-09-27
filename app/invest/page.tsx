"use client";

import { useQuery } from "@tanstack/react-query";
import { Landmark, Search, ShieldCheck, SlidersHorizontal, WifiOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { InvestmentCard, investmentCategoryDetails } from "@/components/investment-card";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import type { InvestmentCategory } from "@/lib/types";

const categories = Object.keys(investmentCategoryDetails) as InvestmentCategory[];

export default function InvestPage() {
  return <Suspense fallback={<PageLoading />}><InvestContent /></Suspense>;
}

function InvestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = (searchParams.get("category") as InvestmentCategory | null) ?? undefined;
  const selectedLocation = searchParams.get("location") ?? "";
  const search = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const opportunities = useQuery({
    queryKey: ["investments", selectedCategory, selectedLocation, search],
    queryFn: () => api.investments({ category: selectedCategory, location: selectedLocation, search }),
    retry: 1
  });

  function setFilters(category = selectedCategory, location = selectedLocation, query = search) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (query.trim()) params.set("search", query.trim());
    router.push(`/invest${params.size ? `?${params.toString()}` : ""}`);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(selectedCategory, selectedLocation, searchInput);
  }

  const items = opportunities.data?.items ?? [];
  return <main><SiteHeader />
    <section className="relative isolate min-h-[480px] overflow-hidden bg-forest-950 text-white"><Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80" alt="Cultivated farmland at sunrise" fill priority sizes="100vw" className="-z-20 object-cover" /><div className="absolute inset-0 -z-10 bg-forest-950/80" /><div className="mx-auto flex min-h-[480px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8"><p className="inline-flex items-center gap-2 text-sm font-black uppercase text-harvest-300"><Landmark size={18} aria-hidden="true" /> Agricultural opportunities</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Explore opportunities shaping Nigeria&apos;s agricultural value chain</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">Review admin-published projects and register a non-binding expression of interest for follow-up by the ZD Crown team.</p><form onSubmit={submitSearch} className="mt-7 flex max-w-2xl flex-col gap-2 rounded-lg bg-white p-2 shadow-soft sm:flex-row"><label className="sr-only" htmlFor="investment-search">Search opportunities</label><input id="investment-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search projects, sectors, or locations" className="min-h-12 flex-1 rounded-md px-4 text-forest-950 placeholder:text-slate-500" /><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest-600 px-6 font-black text-white"><Search size={18} aria-hidden="true" /> Search</button></form></div></section>

    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-end"><div className="flex flex-wrap gap-2" role="group" aria-label="Filter opportunities by category"><button type="button" onClick={() => setFilters(undefined)} aria-pressed={!selectedCategory} className={`min-h-11 rounded-md px-4 text-sm font-black ${!selectedCategory ? "bg-forest-600 text-white" : "border border-forest-100 bg-white text-forest-800"}`}>All opportunities</button>{categories.map((category) => { const { Icon, label } = investmentCategoryDetails[category]; return <button key={category} type="button" onClick={() => setFilters(category)} aria-pressed={selectedCategory === category} className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-black ${selectedCategory === category ? "bg-forest-600 text-white" : "border border-forest-100 bg-white text-forest-800"}`}><Icon size={17} aria-hidden="true" />{label}<span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">{opportunities.data?.counts[category] ?? 0}</span></button>; })}</div><label className="text-sm font-black text-forest-950">Location<select value={selectedLocation} onChange={(event) => setFilters(selectedCategory, event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-forest-100 bg-white px-3 font-semibold text-slate-700"><option value="">All locations</option>{opportunities.data?.locations.map((location) => <option key={location} value={location}>{location}</option>)}</select></label></div>
      <div className="mt-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase text-forest-600">Opportunity catalogue</p><h2 className="mt-1 text-3xl font-black text-forest-950">{selectedCategory ? investmentCategoryDetails[selectedCategory].label : search ? `Results for “${search}”` : "Published opportunities"}</h2></div><p className="text-sm font-bold text-slate-500">{items.length} {items.length === 1 ? "opportunity" : "opportunities"}</p></div>
      {opportunities.isLoading ? <CardSkeletons /> : null}
      {opportunities.isError ? <div className="mt-6 rounded-lg border border-red-100 bg-white p-10 text-center"><WifiOff className="mx-auto text-red-700" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">Opportunities are temporarily unavailable</h2><p className="mt-2 text-slate-600">We could not load the current catalogue. Please try again.</p><button type="button" onClick={() => opportunities.refetch()} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Try again</button></div> : null}
      {!opportunities.isLoading && !opportunities.isError && items.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((opportunity, index) => <InvestmentCard key={opportunity.id} opportunity={opportunity} priority={index < 3} />)}</div> : null}
      {!opportunities.isLoading && !opportunities.isError && !items.length ? <div className="mt-6 rounded-lg border border-forest-100 bg-white p-10 text-center"><SlidersHorizontal className="mx-auto text-forest-600" size={38} aria-hidden="true" /><h2 className="mt-4 text-2xl font-black text-forest-950">No matching opportunities found</h2><p className="mt-2 text-slate-600">Try a broader search or clear your filters.</p><button type="button" onClick={() => { setSearchInput(""); setFilters(undefined, "", ""); }} className="mt-5 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">View all opportunities</button></div> : null}
    </section>

    <section className="bg-white py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid gap-4 md:grid-cols-3">{[[Landmark, "Non-binding interest", "Submitting the form does not transfer funds, reserve an allocation, or create an investment agreement."], [ShieldCheck, "Admin-managed information", "Every public opportunity is deliberately reviewed and published by the ZD Crown team."], [Search, "Independent review", "Project information is preliminary. Verify legal, financial, and operational details before making decisions."]].map(([Icon, title, copy]) => <article key={title as string} className="border-l-4 border-forest-500 bg-forest-50 p-5"><Icon className="text-forest-600" size={24} aria-hidden="true" /><h2 className="mt-3 font-black text-forest-950">{title as string}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p></article>)}</div></div></section>
  </main>;
}

function PageLoading() { return <main><SiteHeader /><div className="h-[480px] animate-pulse bg-forest-900" /><section className="mx-auto max-w-7xl px-4 py-12"><CardSkeletons /></section></main>; }
function CardSkeletons() { return <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[440px] animate-pulse rounded-lg bg-forest-50" />)}</div>; }

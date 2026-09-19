"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Mail,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  UsersRound,
  Video
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";

const categories = ["All", "Fruits", "Grains", "Vegetables", "Livestock", "Poultry", "Fish", "Equipment", "Processed Foods"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [email, setEmail] = useState("");

  const productsQuery = useQuery({
    queryKey: ["products", "", "All"],
    queryFn: () => api.products({ limit: 12 })
  });
  const featured = useMemo(
    () => (productsQuery.data?.items ?? []).filter((product) => product.featured).slice(0, 4),
    [productsQuery.data?.items]
  );

  const newsletter = useMutation({
    mutationFn: () => api.subscribe(email),
    onSuccess: () => setEmail("")
  });

  return (
    <main>
      <SiteHeader />
      <section className="relative isolate overflow-hidden bg-forest-950 text-white">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=80"
          alt="Green farm fields at sunrise"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950 via-forest-950/82 to-forest-700/35" />
        <div className="mx-auto grid min-h-[720px] max-w-7xl content-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-harvest-300/50 bg-forest-950/50 px-4 py-2 text-sm font-bold text-harvest-300">
              <BadgeCheck size={18} aria-hidden="true" /> Halal and export certified supply
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Africa&apos;s trusted agro export marketplace.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-forest-50">
              Buy verified agricultural produce from trusted farmers and suppliers. Browse freely, then sign in to keep your cart private and place an order.
            </p>
            <form
              className="mt-8 grid gap-3 rounded-lg bg-white p-3 shadow-soft sm:grid-cols-[1fr_auto_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const params = new URLSearchParams();
                if (search.trim()) params.set("search", search.trim());
                if (category !== "All") params.set("category", category);
                window.location.href = `/marketplace${params.toString() ? `?${params.toString()}` : ""}`;
              }}
            >
              <label className="sr-only" htmlFor="hero-search">Search products</label>
              <input
                id="hero-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search apricots, sesame, dates..."
                className="min-h-12 rounded-md border border-slate-200 px-4 text-forest-950"
              />
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
                <Search size={19} aria-hidden="true" /> Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Marketplace stats">
        <div className="grid gap-4 rounded-lg border border-forest-100 bg-white p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
          {[
            [UsersRound, "12,000+", "Verified farmers"],
            [PackageCheck, "50,000+", "Products listed"],
            [Globe2, "35", "Countries served"],
            [ShieldCheck, "$8M", "Trade volume"]
          ].map(([Icon, value, label]) => (
            <div key={label as string} className="rounded-md bg-forest-50 p-5">
              <Icon className="text-forest-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-black text-forest-950">{value as string}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{label as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="marketplace">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-forest-600">Featured marketplace</p>
            <h2 className="mt-2 text-4xl font-black text-forest-950">Fresh produce, ready to move</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Preview featured products, then browse the full dedicated marketplace.</p>
          </div>
          <Link href="/marketplace" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest-600 px-5 text-sm font-black text-white transition hover:bg-forest-700">
            View all products <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {productsQuery.isError ? <div className="mt-8 rounded-lg border border-red-100 bg-red-50 p-5 text-center"><p className="font-black text-red-900">Featured products could not be loaded.</p><button type="button" onClick={() => productsQuery.refetch()} className="mt-3 min-h-11 rounded-md bg-forest-600 px-5 font-black text-white">Try again</button></div> : null}
      </section>

      <section className="bg-white py-20" id="trust">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-forest-600">Why buyers trust ZD Crown</p>
              <h2 className="mt-2 text-4xl font-black text-forest-950">Better assurance before money changes hands.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                The rebuilt platform makes verification, certification, and order status visible from the first search through delivery.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [ShieldCheck, "Verified sellers", "Admin-approved supplier profiles and farmer clusters."],
                [Truck, "Delivery clarity", "Collect delivery country, address, notes, and order line items."],
                [PackageCheck, "Export readiness", "Surface export and halal certification at product level."],
                [Globe2, "Protected buyer flow", "Account-based carts keep orders private and easier to track."]
              ].map(([Icon, title, copy]) => (
                <div key={title as string} className="rounded-lg border border-forest-100 bg-forest-50 p-6">
                  <Icon className="text-forest-600" size={28} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-forest-950">{title as string}</h3>
                  <p className="mt-2 leading-6 text-slate-600">{copy as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-20 text-white" id="live-hub">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-harvest-300/40 px-3 py-1 text-sm font-bold text-harvest-300">
              <Video size={16} aria-hidden="true" /> Live hub foundation
            </span>
            <h2 className="mt-4 text-4xl font-black">Global farmers live hub</h2>
            <p className="mx-auto mt-3 max-w-2xl text-forest-100">
              A future community layer for seller education, buyer trust, and live sourcing sessions.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {["Cocoa farming techniques", "Sesame export quality standards", "Smart irrigation systems"].map((session) => (
              <div key={session} className="rounded-lg border border-white/10 bg-white/8 p-6">
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-black">LIVE</span>
                <h3 className="mt-6 text-xl font-black">{session}</h3>
                <p className="mt-2 text-sm text-forest-100">Hosted by verified regional farmers</p>
                <button className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-harvest-300 px-4 text-sm font-black text-forest-950">
                  Join later <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-forest-950 px-6 py-14 text-center text-white sm:px-10">
          <h2 className="text-4xl font-black">Ready to build an order?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest-100">Sign in, build your cart, and review bulk pricing before submitting an order request.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/marketplace" className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 text-sm font-black text-forest-950">
              Browse marketplace
            </Link>
            <Link href="/cart" className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 px-5 text-sm font-black text-white">
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-forest-50 py-16" id="how-it-works">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Mail className="mx-auto text-forest-600" size={34} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-black text-forest-950">Stay updated</h2>
          <p className="mt-2 text-slate-600">Get market prices, export opportunities, and farming tips delivered to your inbox.</p>
          <form
            className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              newsletter.mutate();
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">Email</label>
            <input
              id="newsletter-email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="buyer@example.com"
              className="min-h-12 flex-1 rounded-md border border-forest-100 px-4"
            />
            <button className="min-h-12 rounded-md bg-forest-600 px-6 font-black text-white">Subscribe</button>
          </form>
        </div>
      </section>

      <footer className="bg-forest-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-forest-600 text-sm font-black">ZD</span>
              <span className="text-lg font-black">ZD Crown</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-forest-100">Africa&apos;s trusted agro export and digital marketplace.</p>
          </div>
          <p className="text-sm text-forest-100">Nigeria | support@zdcrown.com</p>
        </div>
      </footer>
    </main>
  );
}

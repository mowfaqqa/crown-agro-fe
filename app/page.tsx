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
import { FormEvent, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { api, formatNaira } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { fallbackProducts } from "@/lib/mock-data";

const categories = ["All", "Fruits", "Grains", "Vegetables", "Livestock", "Poultry", "Fish", "Equipment", "Processed Foods"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [orderState, setOrderState] = useState({ customerName: "", email: "", phone: "", deliveryCountry: "", deliveryAddress: "", notes: "" });
  const { items, subtotal, updateQuantity, clear } = useCart();

  const productsQuery = useQuery({
    queryKey: ["products", search, category],
    queryFn: () => api.products(search, category)
  });
  const products = productsQuery.data ?? fallbackProducts;
  const featured = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);

  const newsletter = useMutation({
    mutationFn: () => api.subscribe(email),
    onSuccess: () => setEmail("")
  });

  const order = useMutation({
    mutationFn: () =>
      api.createOrder({
        ...orderState,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      }),
    onSuccess: () => {
      clear();
      setOrderState({ customerName: "", email: "", phone: "", deliveryCountry: "", deliveryAddress: "", notes: "" });
    }
  });

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length) order.mutate();
  }

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
              Buy verified agricultural produce from trusted farmers and suppliers. Search, build a cart, and request your order as a guest.
            </p>
            <form
              className="mt-8 grid gap-3 rounded-lg bg-white p-3 shadow-soft sm:grid-cols-[1fr_auto_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
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
            <p className="text-sm font-bold uppercase text-forest-600">Marketplace</p>
            <h2 className="mt-2 text-4xl font-black text-forest-950">Fresh produce, ready to move</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Browse verified products with visible inventory, certification, origin, and bulk pricing.</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
                [Globe2, "Global buyer flow", "Guest checkout reduces friction for international buyers."]
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8" id="cart">
        <div>
          <h2 className="text-3xl font-black text-forest-950">Featured deals</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-lg border border-forest-100 bg-white p-6 shadow-line">
          <h2 className="text-2xl font-black text-forest-950">Guest cart</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-slate-600">Your cart is empty. Add products to request an order.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-bold text-forest-950">{item.product.name}</p>
                    <p className="text-sm text-slate-500">{formatNaira(item.product.price)} / {item.product.unit}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                    className="h-11 w-20 rounded-md border border-slate-200 px-3"
                    aria-label={`${item.product.name} quantity`}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between text-lg font-black">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
            </div>
          )}
          <form className="mt-6 space-y-4" onSubmit={submitOrder}>
            {[
              ["customerName", "Full name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["deliveryCountry", "Delivery country", "text"],
              ["deliveryAddress", "Delivery address", "text"]
            ].map(([key, label, type]) => (
              <label key={key} className="block text-sm font-bold text-forest-950">
                {label}
                <input
                  required
                  type={type}
                  value={orderState[key as keyof typeof orderState]}
                  onChange={(event) => setOrderState((current) => ({ ...current, [key]: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal"
                />
              </label>
            ))}
            <label className="block text-sm font-bold text-forest-950">
              Notes
              <textarea
                value={orderState.notes}
                onChange={(event) => setOrderState((current) => ({ ...current, notes: event.target.value }))}
                className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={!items.length || order.isPending}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-forest-600 px-5 font-black text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {order.isPending ? "Submitting..." : "Request order"}
            </button>
            {order.isSuccess ? <p className="text-sm font-bold text-forest-700">Order request submitted. Admin can follow up before payment.</p> : null}
            {order.isError ? <p className="text-sm font-bold text-red-700">Could not submit order. Check the backend and try again.</p> : null}
          </form>
        </aside>
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

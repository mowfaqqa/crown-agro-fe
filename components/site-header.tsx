"use client";

import { BarChart3, BriefcaseBusiness, ChevronDown, CloudSun, GraduationCap, Handshake, LayoutDashboard, LogIn, LogOut, Menu, Newspaper, PackageOpen, Search, Ship, ShoppingCart, Sprout, Tractor, TrendingUp, UserRound, Warehouse, Wifi, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";

const navigation = [
  ["Marketplace", "/marketplace"],
  ["How it works", "/#how-it-works"],
  ["Trust", "/#trust"],
  ["Track order", "/orders/lookup"]
];

const intelligenceNavigation = [
  [TrendingUp, "Commodity prices", "COMMODITY_PRICE"],
  [Newspaper, "Agriculture news", "AGRICULTURE_NEWS"],
  [Ship, "Export opportunities", "EXPORT_OPPORTUNITY"],
  [CloudSun, "Weather advisories", "WEATHER_ADVISORY"]
] as const;

const servicesNavigation = [
  [Tractor, "Equipment rentals", "EQUIPMENT_RENTAL"],
  [BriefcaseBusiness, "Job board", "JOB_BOARD"],
  [GraduationCap, "Training & courses", "TRAINING"],
  [Ship, "Export & logistics", "EXPORT_LOGISTICS"],
  [PackageOpen, "Input suppliers", "INPUT_SUPPLY"],
  [Warehouse, "Warehousing", "WAREHOUSING"],
  [Wifi, "Smart farming", "SMART_FARMING"],
  [Handshake, "Community", "COMMUNITY"]
] as const;

export function SiteHeader() {
  const { totalItems } = useCart();
  const { customer, ready, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartHref = customer ? "/cart" : "/login?returnTo=%2Fcart";

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-white/95 shadow-line backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="ZD Crown home">
          <span className="grid size-10 place-items-center rounded-md bg-forest-600 text-sm font-black text-white">ZD</span>
          <span className="leading-tight"><span className="block text-base font-black text-forest-950">ZD Crown</span><span className="block text-xs font-semibold text-forest-600">Agro Marketplace</span></span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <details className="group relative">
            <summary className={`flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-forest-50 hover:text-forest-800 ${pathname.startsWith("/market-intelligence") ? "bg-forest-50 text-forest-800" : "text-slate-700"}`}><BarChart3 size={17} aria-hidden="true" /> Market intel <ChevronDown size={15} className="transition group-open:rotate-180" aria-hidden="true" /></summary>
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-forest-100 bg-white p-2 shadow-soft">
              <Link href="/market-intelligence" className="flex min-h-11 items-center rounded-md px-3 font-black text-forest-900 hover:bg-forest-50">All intelligence</Link>
              {intelligenceNavigation.map(([Icon, label, type]) => <Link key={type} href={`/market-intelligence?type=${type}`} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-forest-50"><Icon size={18} className="text-forest-600" aria-hidden="true" />{label}</Link>)}
            </div>
          </details>
          <details className="group relative">
            <summary className={`flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-forest-50 hover:text-forest-800 ${pathname.startsWith("/services") ? "bg-forest-50 text-forest-800" : "text-slate-700"}`}><Wrench size={17} aria-hidden="true" /> Services <ChevronDown size={15} className="transition group-open:rotate-180" aria-hidden="true" /></summary>
            <div className="absolute left-0 top-full z-50 mt-2 grid w-[420px] grid-cols-2 rounded-lg border border-forest-100 bg-white p-2 shadow-soft">
              <Link href="/services" className="col-span-2 flex min-h-11 items-center rounded-md px-3 font-black text-forest-900 hover:bg-forest-50">All services</Link>
              {servicesNavigation.map(([Icon, label, category]) => <Link key={category} href={`/services?category=${category}`} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-forest-50"><Icon size={18} className="text-forest-600" aria-hidden="true" />{label}</Link>)}
            </div>
          </details>
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} className={`rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-forest-50 hover:text-forest-800 ${pathname === href ? "bg-forest-50 text-forest-800" : "text-slate-700"}`}>{label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/marketplace" className="hidden min-h-11 items-center gap-2 rounded-md border border-forest-100 px-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50 sm:inline-flex"><Search size={17} aria-hidden="true" /> Search</Link>
          <Link href={cartHref} className="relative inline-flex min-h-11 items-center gap-2 rounded-md bg-forest-950 px-3 text-sm font-bold text-white transition hover:bg-forest-800" aria-label={customer ? `Open cart with ${totalItems} items` : "Sign in to view cart"}>
            <ShoppingCart size={18} aria-hidden="true" /><span className="hidden sm:inline">Cart</span>
            {customer && totalItems > 0 ? <span className="grid min-w-5 place-items-center rounded-full bg-harvest-300 px-1.5 text-xs text-forest-950">{totalItems}</span> : null}
          </Link>
          {ready && !customer ? <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50 md:inline-flex"><LogIn size={18} aria-hidden="true" /> Sign in</Link> : null}
          {customer ? <Link href="/account" className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50 md:inline-flex" title={`Signed in as ${customer.email}`}><UserRound size={18} aria-hidden="true" /> {customer.name.split(" ")[0]}</Link> : null}
          <button type="button" onClick={() => setMenuOpen((current) => !current)} className="inline-grid size-11 place-items-center rounded-md border border-forest-100 text-forest-900 lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-navigation" className="border-t border-forest-100 bg-white px-4 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            <Link href="/market-intelligence" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-2 rounded-md px-3 font-bold text-slate-700 hover:bg-forest-50"><BarChart3 size={18} aria-hidden="true" /> Market intelligence</Link>
            <div className="grid grid-cols-2 gap-1 border-b border-forest-100 pb-2 pl-3">{intelligenceNavigation.map(([Icon, label, type]) => <Link key={type} href={`/market-intelligence?type=${type}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-slate-600 hover:bg-forest-50"><Icon size={16} className="text-forest-600" aria-hidden="true" />{label}</Link>)}</div>
            <details className="border-b border-forest-100 pb-2">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-md px-3 font-bold text-slate-700 hover:bg-forest-50"><Wrench size={18} aria-hidden="true" /> Services <ChevronDown size={16} className="ml-auto" aria-hidden="true" /></summary>
              <div className="grid grid-cols-2 gap-1 pl-3">{servicesNavigation.map(([Icon, label, category]) => <Link key={category} href={`/services?category=${category}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-slate-600 hover:bg-forest-50"><Icon size={16} className="text-forest-600" aria-hidden="true" />{label}</Link>)}</div>
            </details>
            {navigation.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-md px-3 font-bold text-slate-700 hover:bg-forest-50">{label}</Link>)}
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-2 rounded-md px-3 font-bold text-slate-700 hover:bg-forest-50"><LayoutDashboard size={18} aria-hidden="true" /> Admin</Link>
            {customer ? <><Link href="/account" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-2 rounded-md px-3 font-bold text-slate-700 hover:bg-forest-50"><UserRound size={18} aria-hidden="true" /> My account</Link><button type="button" onClick={() => { signOut(); setMenuOpen(false); }} className="flex min-h-12 items-center gap-2 rounded-md px-3 text-left font-bold text-red-700 hover:bg-red-50"><LogOut size={18} aria-hidden="true" /> Sign out {customer.name.split(" ")[0]}</button></> : <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-2 rounded-md bg-forest-600 px-3 font-bold text-white"><LogIn size={18} aria-hidden="true" /> Sign in or register</Link>}
          </div>
        </nav>
      ) : null}

      <div className="border-t border-forest-100 bg-forest-50/80 px-4 py-2 text-center text-xs font-semibold text-forest-800"><Sprout className="mr-1 inline" size={14} aria-hidden="true" /> Verified sellers, export-ready produce, and protected buyer carts.</div>
    </header>
  );
}

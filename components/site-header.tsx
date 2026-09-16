"use client";

import { LayoutDashboard, Menu, Search, ShoppingCart, Sprout } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function SiteHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-white/94 shadow-line backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="ZD Crown home">
          <span className="grid size-10 place-items-center rounded-md bg-forest-600 text-sm font-black text-white">ZD</span>
          <span className="leading-tight">
            <span className="block text-base font-black text-forest-950">ZD Crown</span>
            <span className="block text-xs font-semibold text-forest-600">Agro Marketplace</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {[
            ["Marketplace", "/marketplace"],
            ["How it works", "/#how-it-works"],
            ["Trust", "/#trust"],
            ["Live hub", "/#live-hub"],
            ["Track order", "/orders/lookup"]
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-forest-50 hover:text-forest-800"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/marketplace"
            className="hidden min-h-11 items-center gap-2 rounded-md border border-forest-100 px-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50 sm:inline-flex"
          >
            <Search size={17} aria-hidden="true" /> Search
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex min-h-11 items-center gap-2 rounded-md bg-forest-950 px-3 text-sm font-bold text-white transition hover:bg-forest-800"
            aria-label={`Open cart with ${totalItems} item${totalItems === 1 ? "" : "s"}`}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-harvest-300 px-1.5 text-xs text-forest-950">
                {totalItems}
              </span>
            ) : null}
          </Link>
          <Link
            href="/admin"
            className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50 md:inline-flex"
          >
            <LayoutDashboard size={18} aria-hidden="true" /> Admin
          </Link>
          <button
            type="button"
            className="inline-grid size-11 place-items-center rounded-md border border-forest-100 text-forest-900 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="border-t border-forest-100 bg-forest-50/80 px-4 py-2 text-center text-xs font-semibold text-forest-800">
        <Sprout className="mr-1 inline" size={14} aria-hidden="true" />
        Verified sellers, export-ready produce, and guest ordering for faster buying.
      </div>
    </header>
  );
}

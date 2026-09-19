"use client";

import { ArrowLeft, LockKeyhole, PackageOpen, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { formatNaira } from "@/lib/api";
import { unitPriceFor, useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

export default function CartPage() {
  const { items, subtotal, updateQuantity, clear } = useCart();
  const { customer, ready } = useAuth();

  if (!ready) {
    return <main><SiteHeader /><div className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-4 py-12"><div className="h-96 rounded-lg bg-forest-50" /></div></main>;
  }

  if (!customer) {
    return (
      <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center"><div><LockKeyhole className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Sign in to use your cart</h1><p className="mx-auto mt-3 max-w-xl text-lg leading-7 text-slate-600">Buyer carts are tied to an account so products and quantities stay private on shared devices.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/login?returnTo=%2Fcart" className="inline-flex min-h-12 items-center justify-center rounded-md bg-forest-600 px-6 font-black text-white">Sign in or register</Link><Link href="/marketplace" className="inline-flex min-h-12 items-center justify-center rounded-md border border-forest-100 bg-white px-6 font-black text-forest-800">Keep browsing</Link></div></div></section></main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-bold text-forest-800">
          <ArrowLeft size={17} aria-hidden="true" /> Back to marketplace
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <section className="rounded-lg border border-forest-100 bg-white shadow-line">
            <div className="border-b border-forest-100 p-6">
              <p className="text-sm font-bold uppercase text-forest-600">Cart</p>
              <h1 className="mt-1 text-3xl font-black text-forest-950">Review products before checkout</h1>
            </div>

            {items.length === 0 ? (
              <div className="grid min-h-96 place-items-center p-8 text-center">
                <div>
                  <PackageOpen className="mx-auto text-forest-600" size={44} aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-black text-forest-950">Your cart is empty</h2>
                  <p className="mt-2 text-slate-600">Add verified products from the marketplace to start an order request.</p>
                  <Link href="/marketplace" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">
                    Browse marketplace
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <article key={item.product.id} className="grid gap-4 p-5 md:grid-cols-[112px_1fr_auto] md:items-center">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-forest-50">
                      <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="112px" className="object-cover" />
                    </div>
                    <div>
                      <Link href={`/products/${item.product.slug}`} className="text-lg font-black text-forest-950 transition hover:text-forest-700">
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">{item.product.sellerName} | {item.product.countryOfOrigin}</p>
                      <p className="mt-2 font-black text-forest-950">{formatNaira(unitPriceFor(item.product, item.quantity))} / {item.product.unit}</p>
                      {unitPriceFor(item.product, item.quantity) < item.product.price ? <p className="mt-1 text-sm font-bold text-forest-700">Bulk price applied</p> : null}
                    </div>
                    <div className="flex items-center gap-3 md:justify-end">
                      <label className="block text-sm font-bold text-forest-950">
                        Quantity
                        <input
                          type="number"
                          min={1}
                          max={item.product.stockQuantity}
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                          className="mt-1 h-11 w-24 rounded-md border border-slate-200 px-3 font-normal"
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-500">Max {item.product.stockQuantity}</span>
                      </label>
                      <button type="button" onClick={() => updateQuantity(item.product.id, 0)} className="grid size-11 place-items-center rounded-md bg-red-50 text-red-700" aria-label={`Remove ${item.product.name}`}>
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-md bg-forest-600 text-white">
                <ShoppingBag size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-black text-forest-950">Summary</h2>
                <p className="text-sm text-slate-600">{items.length} product line{items.length === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-black text-forest-950">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <p className="rounded-md bg-harvest-100 p-3 text-sm font-bold text-forest-950">
                Payment is not collected yet. Checkout submits an order request for admin follow-up.
              </p>
              <Link
                href="/checkout"
                aria-disabled={!items.length}
                className={`inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 font-black text-white transition ${
                  items.length ? "bg-forest-600 hover:bg-forest-700" : "pointer-events-none bg-slate-300"
                }`}
              >
                Continue to checkout
              </Link>
              {items.length ? (
                <button type="button" onClick={clear} className="min-h-11 w-full rounded-md border border-slate-200 px-4 font-bold text-slate-700">
                  Clear cart
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

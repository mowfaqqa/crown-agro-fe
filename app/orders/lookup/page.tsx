"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, PackageCheck, SearchCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, formatNaira } from "@/lib/api";

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const lookup = useMutation({
    mutationFn: () => api.lookupOrder(orderNumber, email)
  });

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lookup.mutate();
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-bold text-forest-800">
          <ArrowLeft size={17} aria-hidden="true" /> Back home
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <section className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <div className="grid size-12 place-items-center rounded-md bg-forest-600 text-white">
              <SearchCheck size={24} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-3xl font-black text-forest-950">Track an order</h1>
            <p className="mt-2 leading-7 text-slate-600">Use the order number and email address from checkout to see the latest status.</p>

            <form className="mt-6 space-y-4" onSubmit={submitLookup}>
              <label className="block text-sm font-bold text-forest-950">
                Order number
                <input
                  required
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value)}
                  placeholder="ZDC-M..."
                  className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal uppercase"
                />
              </label>
              <label className="block text-sm font-bold text-forest-950">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal"
                />
              </label>
              <button type="submit" disabled={lookup.isPending} className="min-h-12 w-full rounded-md bg-forest-600 font-black text-white transition hover:bg-forest-700 disabled:opacity-50">
                {lookup.isPending ? "Checking..." : "Check order"}
              </button>
              {lookup.isError ? <p className="text-sm font-bold text-red-700">No matching order found. Check the order number and email.</p> : null}
            </form>
          </section>

          <section className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            {lookup.data ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-sm font-bold uppercase text-forest-600">Order status</p>
                    <h2 className="mt-1 text-3xl font-black text-forest-950">{lookup.data.orderNumber}</h2>
                    <p className="mt-2 text-slate-600">{lookup.data.customerName} | {lookup.data.deliveryCountry}</p>
                  </div>
                  <span className="rounded-full bg-forest-50 px-4 py-2 text-sm font-black text-forest-800">{lookup.data.status.replace("_", " ")}</span>
                </div>

                <div className="mt-5 space-y-4">
                  {lookup.data.items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-lg bg-forest-50 p-3">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-white">
                        <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-forest-950">{item.product.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.quantity} x {formatNaira(item.unitPrice)} / {item.product.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-md border border-slate-200 p-4">
                  <span className="font-black text-forest-950">Subtotal</span>
                  <span className="text-xl font-black text-forest-950">{formatNaira(lookup.data.subtotal)}</span>
                </div>
              </div>
            ) : (
              <div className="grid min-h-80 place-items-center rounded-lg bg-forest-50 p-6 text-center">
                <div>
                  <PackageCheck className="mx-auto text-forest-600" size={42} aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-black text-forest-950">Order details will appear here</h2>
                  <p className="mt-2 text-slate-600">No account is required. Buyers only need their order number and email.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

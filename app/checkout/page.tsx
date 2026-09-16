"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ClipboardCheck, PackageOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, formatNaira } from "@/lib/api";
import { useCart } from "@/lib/cart-store";

const emptyOrder = {
  customerName: "",
  email: "",
  phone: "",
  deliveryCountry: "",
  deliveryAddress: "",
  notes: ""
};

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, clear } = useCart();
  const [orderState, setOrderState] = useState(emptyOrder);
  const order = useMutation({
    mutationFn: () =>
      api.createOrder({
        ...orderState,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      }),
    onSuccess: () => {
      clear();
      setOrderState(emptyOrder);
    }
  });

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length) order.mutate();
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/#marketplace" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-bold text-forest-800">
          <ArrowLeft size={17} aria-hidden="true" /> Continue shopping
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <section className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-md bg-forest-600 text-white">
                <ClipboardCheck size={24} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-forest-600">Guest checkout</p>
                <h1 className="text-3xl font-black text-forest-950">Request your order</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Submit your buyer details and ZD Crown will confirm availability, delivery options, and payment instructions before Paystack is enabled.
            </p>

            {order.isSuccess ? (
              <div className="mt-6 rounded-lg border border-forest-200 bg-forest-50 p-5">
                <CheckCircle2 className="text-forest-600" size={28} aria-hidden="true" />
                <h2 className="mt-3 text-xl font-black text-forest-950">Order request received</h2>
                <p className="mt-2 text-slate-600">Your request is now in the admin queue. The next milestone will add richer notifications and payment readiness.</p>
              </div>
            ) : null}

            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submitOrder}>
              {[
                ["customerName", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "tel"],
                ["deliveryCountry", "Delivery country", "text"],
                ["deliveryAddress", "Delivery address", "text"]
              ].map(([key, label, type]) => (
                <label key={key} className={key === "deliveryAddress" ? "block text-sm font-bold text-forest-950 sm:col-span-2" : "block text-sm font-bold text-forest-950"}>
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
              <label className="block text-sm font-bold text-forest-950 sm:col-span-2">
                Notes
                <textarea
                  value={orderState.notes}
                  onChange={(event) => setOrderState((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 font-normal"
                />
              </label>
              <button
                type="submit"
                disabled={!items.length || order.isPending}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-forest-600 px-5 font-black text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
              >
                {order.isPending ? "Submitting..." : "Submit order request"}
              </button>
              {order.isError ? <p className="text-sm font-bold text-red-700 sm:col-span-2">Could not submit order. Check the backend and try again.</p> : null}
            </form>
          </section>

          <aside className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <h2 className="text-2xl font-black text-forest-950">Order summary</h2>
            {items.length === 0 ? (
              <div className="mt-6 rounded-lg bg-forest-50 p-5 text-center">
                <PackageOpen className="mx-auto text-forest-600" size={36} aria-hidden="true" />
                <p className="mt-3 font-bold text-forest-950">Your cart is empty</p>
                <Link href="/#marketplace" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-4 text-sm font-black text-white">
                  Browse marketplace
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="border-b border-slate-100 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-forest-950">{item.product.name}</p>
                        <p className="text-sm text-slate-500">{formatNaira(item.product.price)} / {item.product.unit}</p>
                      </div>
                      <button type="button" onClick={() => updateQuantity(item.product.id, 0)} className="grid size-10 place-items-center rounded-md text-red-700" aria-label={`Remove ${item.product.name}`}>
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <label className="mt-3 block text-sm font-bold text-forest-950">
                      Quantity
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                        className="mt-1 h-11 w-24 rounded-md border border-slate-200 px-3 font-normal"
                      />
                    </label>
                  </div>
                ))}
                <div className="flex items-center justify-between text-lg font-black text-forest-950">
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <p className="rounded-md bg-harvest-100 p-3 text-sm font-bold text-forest-950">Payment is not collected yet. Paystack will be introduced in a later milestone.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

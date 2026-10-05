"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ClipboardCheck, LockKeyhole, MailWarning, PackageOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api, formatNaira } from "@/lib/api";
import { unitPriceFor, useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

const emptyOrder = {
  phone: "",
  deliveryCountry: "",
  deliveryAddress: "",
  notes: ""
};
const CHECKOUT_KEY_STORAGE = "zd-crown-checkout-key";

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, clear } = useCart();
  const { customer, token, ready, signOut } = useAuth();
  const [orderState, setOrderState] = useState(emptyOrder);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    if (!customer) {
      setIdempotencyKey("");
      return;
    }
    const storageKey = `${CHECKOUT_KEY_STORAGE}:${customer.id}`;
    const stored = window.sessionStorage.getItem(storageKey);
    const key = stored ?? crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, key);
    setIdempotencyKey(key);
  }, [customer]);
  const order = useMutation({
    mutationFn: () =>
      api.createOrder(token ?? "", {
        ...orderState,
        idempotencyKey,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      }),
    onSuccess: () => {
      if (customer) window.sessionStorage.removeItem(`${CHECKOUT_KEY_STORAGE}:${customer.id}`);
      clear();
      setOrderState(emptyOrder);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) signOut();
    }
  });
  const resendVerification = useMutation({ mutationFn: () => api.resendVerification(token ?? "") });

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length && idempotencyKey) order.mutate();
  }

  if (!ready) return <main><SiteHeader /><div className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-4 py-12"><div className="h-96 rounded-lg bg-forest-50" /></div></main>;
  if (!customer || !token) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center"><div><LockKeyhole className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Sign in before checkout</h1><p className="mt-3 text-lg text-slate-600">Checkout is available to registered buyers only.</p><Link href="/login?returnTo=%2Fcheckout" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Sign in or register</Link></div></section></main>;
  if (!customer.emailVerified) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center"><div><MailWarning className="mx-auto text-amber-700" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Verify your email before checkout</h1><p className="mx-auto mt-3 max-w-xl text-lg leading-7 text-slate-600">Use the verification link sent to {customer.email}. This protects orders from being placed with an address you do not control.</p><button type="button" onClick={() => resendVerification.mutate()} disabled={resendVerification.isPending || resendVerification.isSuccess} className="mt-6 min-h-12 rounded-md bg-forest-600 px-6 font-black text-white disabled:opacity-50">{resendVerification.isSuccess ? "Verification email sent" : resendVerification.isPending ? "Sending..." : "Resend verification email"}</button><div><Link href="/account" className="mt-4 inline-flex min-h-11 items-center font-black text-forest-700 underline">Go to my account</Link></div></div></section></main>;

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-bold text-forest-800">
          <ArrowLeft size={17} aria-hidden="true" /> Back to marketplace
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <section className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-md bg-forest-600 text-white">
                <ClipboardCheck size={24} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-forest-600">Secure buyer checkout</p>
                <h1 className="text-3xl font-black text-forest-950">Request your order</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Signed in as {customer.name} ({customer.email}). Confirm delivery details; once ZD Crown approves availability, secure Paystack payment will appear in your account.
            </p>

            {order.isSuccess ? (
              <div className="mt-6 rounded-lg border border-forest-200 bg-forest-50 p-5">
                <CheckCircle2 className="text-forest-600" size={28} aria-hidden="true" />
                <h2 className="mt-3 text-xl font-black text-forest-950">Order request received</h2>
                <p className="mt-2 text-slate-600">Your request is now in the admin queue. Keep this order number for follow-up.</p>
                <div className="mt-4 grid gap-3 rounded-md bg-white p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold text-slate-500">Order number</p>
                    <p className="mt-1 text-xl font-black text-forest-950">{order.data.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">Subtotal</p>
                    <p className="mt-1 text-xl font-black text-forest-950">{formatNaira(order.data.subtotal)}</p>
                  </div>
                </div>
                <Link href="/orders/lookup" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-4 text-sm font-black text-white">
                  Track this order
                </Link>
              </div>
            ) : null}

            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submitOrder}>
              {[
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
                disabled={!items.length || !idempotencyKey || order.isPending}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-forest-600 px-5 font-black text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
              >
                {order.isPending ? "Submitting..." : "Submit order request"}
              </button>
              {order.isError ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800 sm:col-span-2">{order.error instanceof ApiError ? order.error.message : "Could not submit the order. Please try again."}</p> : null}
            </form>
          </section>

          <aside className="rounded-lg border border-forest-100 bg-white p-6 shadow-line">
            <h2 className="text-2xl font-black text-forest-950">Order summary</h2>
            {items.length === 0 ? (
              <div className="mt-6 rounded-lg bg-forest-50 p-5 text-center">
                <PackageOpen className="mx-auto text-forest-600" size={36} aria-hidden="true" />
                <p className="mt-3 font-bold text-forest-950">Your cart is empty</p>
                <Link href="/marketplace" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-4 text-sm font-black text-white">
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
                        <p className="text-sm text-slate-500">{formatNaira(unitPriceFor(item.product, item.quantity))} / {item.product.unit}</p>
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
                        max={item.product.stockQuantity}
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
                <p className="rounded-md bg-harvest-100 p-3 text-sm font-bold text-forest-950">No payment is collected with this request. After availability is confirmed, pay securely with Paystack from your account.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

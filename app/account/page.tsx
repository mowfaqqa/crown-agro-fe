"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LogOut, MailWarning, PackageOpen, Save, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api, formatNaira } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { customer, token, ready, setSession, signOut } = useAuth();
  const [name, setName] = useState(customer?.name ?? "");
  useEffect(() => { if (customer) setName(customer.name); }, [customer]);

  const orders = useQuery({ queryKey: ["customer-orders", customer?.id], queryFn: () => api.customerOrders(token ?? ""), enabled: Boolean(token) });
  const saveProfile = useMutation({
    mutationFn: () => api.updateCustomerProfile(token ?? "", name),
    onSuccess: (updated) => { if (token) setSession({ accessToken: token, customer: updated }); }
  });
  const resend = useMutation({ mutationFn: () => api.resendVerification(token ?? "") });

  if (!ready) return <main><SiteHeader /><div className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-4 py-12"><div className="h-96 rounded-lg bg-forest-50" /></div></main>;
  if (!customer || !token) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] place-items-center px-4 text-center"><div><UserRound className="mx-auto text-forest-600" size={44} /><h1 className="mt-4 text-3xl font-black text-forest-950">Sign in to view your account</h1><Link href="/login?returnTo=%2Faccount" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Sign in</Link></div></section></main>;

  function submitProfile(event: FormEvent<HTMLFormElement>) { event.preventDefault(); saveProfile.mutate(); }

  return <main><SiteHeader /><section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase text-forest-600">Buyer account</p><h1 className="mt-1 text-4xl font-black text-forest-950">Welcome, {customer.name.split(" ")[0]}</h1><p className="mt-2 text-slate-600">Manage your profile and follow every order from one place.</p></div><button type="button" onClick={() => { signOut(); router.replace("/"); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 font-bold text-slate-700"><LogOut size={18} /> Sign out</button></div>

    {!customer.emailVerified ? <div className="mt-6 flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><MailWarning className="mt-0.5 shrink-0 text-amber-800" size={22} /><div><h2 className="font-black text-amber-950">Verify your email before checkout</h2><p className="mt-1 text-sm text-amber-900">We sent the verification link to {customer.email}.</p></div></div><button type="button" onClick={() => resend.mutate()} disabled={resend.isPending || resend.isSuccess} className="min-h-11 rounded-md bg-amber-900 px-4 font-black text-white disabled:opacity-50">{resend.isSuccess ? "Email sent" : resend.isPending ? "Sending..." : "Resend email"}</button></div> : null}

    <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
      <form onSubmit={submitProfile} className="rounded-lg border border-forest-100 bg-white p-6 shadow-line"><UserRound className="text-forest-600" size={28} /><h2 className="mt-3 text-2xl font-black text-forest-950">Profile</h2><label className="mt-5 block text-sm font-bold text-forest-950">Full name<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal" /></label><label className="mt-4 block text-sm font-bold text-forest-950">Email<input readOnly value={customer.email} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal text-slate-600" /></label>{saveProfile.isSuccess ? <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-forest-700"><CheckCircle2 size={16} /> Profile updated</p> : null}{saveProfile.isError ? <p role="alert" className="mt-3 text-sm font-bold text-red-700">{saveProfile.error instanceof ApiError ? saveProfile.error.message : "Could not update profile."}</p> : null}<button disabled={saveProfile.isPending || name.trim() === customer.name} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Save size={17} /> {saveProfile.isPending ? "Saving..." : "Save profile"}</button></form>

      <section><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase text-forest-600">Order history</p><h2 className="mt-1 text-3xl font-black text-forest-950">Your orders</h2></div><button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ["customer-orders", customer.id] })} className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-bold">Refresh</button></div>
        {orders.isLoading ? <div className="mt-5 h-64 animate-pulse rounded-lg bg-forest-50" /> : null}
        {orders.isError ? <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-5"><p className="font-bold text-red-800">Could not load order history.</p><button type="button" onClick={() => orders.refetch()} className="mt-3 min-h-11 rounded-md bg-forest-600 px-4 font-black text-white">Try again</button></div> : null}
        {!orders.isLoading && !orders.isError && !orders.data?.length ? <div className="mt-5 rounded-lg border border-forest-100 bg-white p-10 text-center"><PackageOpen className="mx-auto text-forest-600" size={40} /><h3 className="mt-3 text-xl font-black text-forest-950">No orders yet</h3><p className="mt-2 text-slate-600">Products you check out will appear here.</p><Link href="/marketplace" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">Browse marketplace</Link></div> : null}
        <div className="mt-5 space-y-4">{orders.data?.map((order) => <article key={order.id} className="rounded-lg border border-forest-100 bg-white p-5 shadow-line"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-forest-600">{new Date(order.createdAt).toLocaleDateString()}</p><h3 className="mt-1 text-xl font-black text-forest-950">{order.orderNumber}</h3></div><span className="rounded-full bg-forest-50 px-3 py-1 text-sm font-black text-forest-800">{order.status.replaceAll("_", " ")}</span></div><div className="mt-4 space-y-3">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3"><div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-forest-50"><Image src={item.product.imageUrl} alt="" fill sizes="56px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="font-bold text-forest-950">{item.product.name}</p><p className="text-sm text-slate-600">{item.quantity} x {formatNaira(item.unitPrice)}</p></div></div>)}</div><div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-black text-forest-950"><span>Total</span><span>{formatNaira(order.subtotal)}</span></div></article>)}</div>
      </section>
    </div>
  </section></main>;
}

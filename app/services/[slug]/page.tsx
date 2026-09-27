"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Mail, MapPin, Send, WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { serviceCategoryDetails } from "@/components/service-card";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

export default function ServiceDetailPage() {
  const queryClient = useQueryClient();
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { customer, token, ready } = useAuth();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const serviceQuery = useQuery({ queryKey: ["service", params.slug], queryFn: () => api.serviceBySlug(params.slug), retry: 1 });
  const enquiry = useMutation({
    mutationFn: () => api.createServiceEnquiry(token ?? "", serviceQuery.data?.id ?? "", { phone, message }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customer-service-enquiries", customer?.id] })
  });
  const service = serviceQuery.data;

  if (serviceQuery.isLoading) return <main><SiteHeader /><div className="mx-auto min-h-[70vh] max-w-6xl animate-pulse px-4 py-12"><div className="h-[560px] rounded-lg bg-forest-50" /></div></main>;
  if (serviceQuery.isError || !service) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 text-center"><div><WifiOff className="mx-auto text-red-700" size={40} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Service unavailable</h1><p className="mt-3 text-slate-600">This listing may be unpublished, archived, or temporarily unavailable.</p><Link href="/services" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">Back to services</Link></div></section></main>;

  const details = serviceCategoryDetails[service.category];
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); enquiry.mutate(); }

  return <main><SiteHeader /><article>
    <header className="border-b border-forest-100 bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><Link href="/services" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-forest-700"><ArrowLeft size={17} aria-hidden="true" /> Services</Link><div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-black text-forest-700"><details.Icon size={18} aria-hidden="true" />{details.label}{service.featured ? <span className="rounded-full bg-harvest-100 px-3 py-1 text-xs text-forest-950">Featured</span> : null}</div><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-forest-950 sm:text-5xl">{service.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{service.summary}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500"><span>{service.providerName}</span>{service.location ? <span className="inline-flex items-center gap-1"><MapPin size={16} aria-hidden="true" />{service.location}</span> : null}</div></div></header>
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <div>{service.imageUrl ? <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-forest-50"><Image src={service.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" /></div> : null}<h2 className="text-2xl font-black text-forest-950">About this service</h2><div className="mt-4 space-y-5 text-lg leading-8 text-slate-700">{service.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="mt-10 border-l-4 border-harvest-500 bg-harvest-100 p-5"><h2 className="font-black text-forest-950">Before you proceed</h2><p className="mt-2 leading-7 text-slate-700">An enquiry starts a conversation only. Confirm availability, scope, credentials, timelines, and commercial terms before making any commitment.</p></div></div>
      <aside className="h-fit rounded-lg border border-forest-100 bg-white p-5 shadow-soft lg:sticky lg:top-28"><Mail className="text-forest-600" size={28} aria-hidden="true" /><h2 className="mt-3 text-2xl font-black text-forest-950">Send an enquiry</h2><p className="mt-2 text-sm leading-6 text-slate-600">Tell the ZD Crown team what you need and how to reach you.</p>
        {!ready ? <div className="mt-5 h-28 animate-pulse rounded-md bg-forest-50" /> : !customer ? <div className="mt-5 rounded-md bg-forest-50 p-4"><p className="text-sm leading-6 text-slate-700">Sign in or create a customer account to send an enquiry.</p><Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest-600 px-4 font-black text-white">Sign in to enquire</Link></div> : !customer.emailVerified ? <div className="mt-5 rounded-md bg-amber-50 p-4"><p className="text-sm font-bold leading-6 text-amber-900">Verify your email address before sending an enquiry.</p><Link href="/account" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest-600 px-4 font-black text-white">Open account</Link></div> : enquiry.isSuccess ? <div role="status" className="mt-5 rounded-md bg-forest-50 p-5 text-center"><CheckCircle2 className="mx-auto text-forest-600" size={36} aria-hidden="true" /><h3 className="mt-3 text-xl font-black text-forest-950">Enquiry sent</h3><p className="mt-2 text-sm leading-6 text-slate-600">The team has received your request and will follow up using your contact details.</p></div> : <form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-black text-forest-950">Phone number<input required minLength={7} maxLength={30} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /></label><label className="block text-sm font-black text-forest-950">What do you need?<textarea required minLength={20} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Include location, timing, quantity, or other relevant requirements." className="mt-1 min-h-36 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" /></label>{enquiry.isError ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{enquiry.error instanceof ApiError ? enquiry.error.message : "Could not send your enquiry. Please try again."}</p> : null}<button type="submit" disabled={enquiry.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Send size={18} aria-hidden="true" />{enquiry.isPending ? "Sending..." : "Send enquiry"}</button></form>}
      </aside>
    </div>
  </article></main>;
}

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, Landmark, MapPin, Send, ShieldAlert, WalletCards, WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { investmentCategoryDetails } from "@/components/investment-card";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api, formatNaira } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import type { InvestorType } from "@/lib/types";

const investorTypes: { value: InvestorType; label: string }[] = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "BUSINESS", label: "Business" },
  { value: "INSTITUTION", label: "Financial institution" },
  { value: "NGO", label: "NGO or development organization" },
  { value: "GOVERNMENT", label: "Government agency" }
];

export default function InvestmentDetailPage() {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { customer, token, ready } = useAuth();
  const [investorType, setInvestorType] = useState<InvestorType>("INDIVIDUAL");
  const [organizationName, setOrganizationName] = useState("");
  const [phone, setPhone] = useState("");
  const [indicativeAmount, setIndicativeAmount] = useState("");
  const [message, setMessage] = useState("");
  const opportunityQuery = useQuery({ queryKey: ["investment", params.slug], queryFn: () => api.investmentBySlug(params.slug), retry: 1 });
  const opportunity = opportunityQuery.data;
  const interest = useMutation({
    mutationFn: () => api.expressInvestmentInterest(token ?? "", opportunity?.id ?? "", {
      investorType,
      organizationName: organizationName.trim() || undefined,
      phone,
      indicativeAmount: indicativeAmount ? Number(indicativeAmount) : undefined,
      message
    })
  });

  if (opportunityQuery.isLoading) return <main><SiteHeader /><div className="mx-auto min-h-[70vh] max-w-6xl animate-pulse px-4 py-12"><div className="h-[600px] rounded-lg bg-forest-50" /></div></main>;
  if (opportunityQuery.isError || !opportunity) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 text-center"><div><WifiOff className="mx-auto text-red-700" size={40} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Opportunity unavailable</h1><p className="mt-3 text-slate-600">This opportunity may be unpublished, archived, or temporarily unavailable.</p><Link href="/invest" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">Back to opportunities</Link></div></section></main>;

  const details = investmentCategoryDetails[opportunity.category];
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); interest.mutate(); }

  return <main><SiteHeader /><article><header className="border-b border-forest-100 bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><Link href="/invest" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-forest-700"><ArrowLeft size={17} aria-hidden="true" /> Opportunities</Link><div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-black text-forest-700"><details.Icon size={18} aria-hidden="true" />{details.label}{opportunity.featured ? <span className="rounded-full bg-harvest-100 px-3 py-1 text-xs text-forest-950">Featured</span> : null}<span className={`rounded-full px-3 py-1 text-xs ${opportunity.openForInterest ? "bg-forest-50 text-forest-800" : "bg-slate-100 text-slate-700"}`}>{opportunity.openForInterest ? "Open for interest" : "Interest paused"}</span></div><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-forest-950 sm:text-5xl">{opportunity.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{opportunity.summary}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">{opportunity.location ? <span className="inline-flex items-center gap-1"><MapPin size={16} aria-hidden="true" />{opportunity.location}</span> : <span>Nigeria</span>}{opportunity.durationMonths ? <span className="inline-flex items-center gap-1"><CalendarDays size={16} aria-hidden="true" />Estimated {opportunity.durationMonths} months</span> : null}</div></div></header>
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_400px] lg:px-8"><div>{opportunity.imageUrl ? <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-forest-50"><Image src={opportunity.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" /></div> : null}<div className="mb-8 grid gap-4 sm:grid-cols-3">{opportunity.fundingTarget ? <Metric Icon={Landmark} label="Indicative target" value={formatNaira(opportunity.fundingTarget)} /> : null}{opportunity.minimumInterestAmount ? <Metric Icon={WalletCards} label="Indicative minimum" value={formatNaira(opportunity.minimumInterestAmount)} /> : null}{opportunity.durationMonths ? <Metric Icon={CalendarDays} label="Estimated duration" value={`${opportunity.durationMonths} months`} /> : null}</div><h2 className="text-2xl font-black text-forest-950">Opportunity overview</h2><div className="mt-4 space-y-5 text-lg leading-8 text-slate-700">{opportunity.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="mt-10 border-l-4 border-amber-500 bg-amber-50 p-5"><div className="flex items-center gap-2 text-amber-900"><ShieldAlert size={22} aria-hidden="true" /><h2 className="font-black">Risk and due diligence</h2></div><p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{opportunity.riskSummary}</p></div></div>
      <aside className="h-fit rounded-lg border border-forest-100 bg-white p-5 shadow-soft lg:sticky lg:top-28"><Landmark className="text-forest-600" size={28} aria-hidden="true" /><h2 className="mt-3 text-2xl font-black text-forest-950">Express interest</h2><p className="mt-2 text-sm leading-6 text-slate-600">This non-binding form requests a follow-up conversation. No payment is collected.</p>
        {!opportunity.openForInterest ? <div className="mt-5 rounded-md bg-slate-100 p-4 text-sm font-bold leading-6 text-slate-700">This opportunity is not currently accepting expressions of interest.</div> : !ready ? <div className="mt-5 h-28 animate-pulse rounded-md bg-forest-50" /> : !customer ? <div className="mt-5 rounded-md bg-forest-50 p-4"><p className="text-sm leading-6 text-slate-700">Sign in or create a customer account to express interest.</p><Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest-600 px-4 font-black text-white">Sign in to continue</Link></div> : !customer.emailVerified ? <div className="mt-5 rounded-md bg-amber-50 p-4"><p className="text-sm font-bold leading-6 text-amber-900">Verify your email address before expressing interest.</p><Link href="/account" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest-600 px-4 font-black text-white">Open account</Link></div> : interest.isSuccess ? <div role="status" className="mt-5 rounded-md bg-forest-50 p-5 text-center"><CheckCircle2 className="mx-auto text-forest-600" size={36} aria-hidden="true" /><h3 className="mt-3 text-xl font-black text-forest-950">Interest registered</h3><p className="mt-2 text-sm leading-6 text-slate-600">The team has received your details and will contact you about suitable next steps.</p></div> : <form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-black text-forest-950">Investor type<select value={investorType} onChange={(event) => setInvestorType(event.target.value as InvestorType)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal">{investorTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>{investorType !== "INDIVIDUAL" ? <label className="block text-sm font-black text-forest-950">Organization name<input required maxLength={160} value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /></label> : null}<label className="block text-sm font-black text-forest-950">Phone number<input required minLength={7} maxLength={30} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /></label><label className="block text-sm font-black text-forest-950">Indicative amount (NGN)<input min={1} type="number" inputMode="numeric" value={indicativeAmount} onChange={(event) => setIndicativeAmount(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /><span className="mt-1 block text-xs font-normal leading-5 text-slate-500">Optional and non-binding. No funds are collected.</span></label><label className="block text-sm font-black text-forest-950">What would you like to discuss?<textarea required minLength={20} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 min-h-32 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" /></label>{interest.isError ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{interest.error instanceof ApiError ? interest.error.message : "Could not register your interest. Please try again."}</p> : null}<button type="submit" disabled={interest.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Send size={18} aria-hidden="true" />{interest.isPending ? "Submitting..." : "Register interest"}</button></form>}
      </aside></div>
    </article></main>;
}

function Metric({ Icon, label, value }: { Icon: typeof Landmark; label: string; value: string }) { return <div className="rounded-lg border border-forest-100 bg-white p-4"><Icon className="text-forest-600" size={22} aria-hidden="true" /><span className="mt-3 block text-xs font-bold text-slate-500">{label}</span><span className="mt-1 block font-black text-forest-950">{value}</span></div>; }

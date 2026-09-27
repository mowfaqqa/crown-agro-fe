"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Landmark, LogOut, MailWarning, PackageOpen, RefreshCw, Save, UserRound, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api, formatNaira } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

type ActivityTab = "orders" | "services" | "investments";

const activityTabs = [
  { value: "orders" as const, label: "Orders", icon: ClipboardList },
  { value: "services" as const, label: "Service enquiries", icon: Wrench },
  { value: "investments" as const, label: "Investment interest", icon: Landmark }
];

export default function AccountPage() {
  const router = useRouter();
  const { customer, token, ready, setSession, signOut } = useAuth();
  const [name, setName] = useState(customer?.name ?? "");
  const [activityTab, setActivityTab] = useState<ActivityTab>("orders");

  useEffect(() => { if (customer) setName(customer.name); }, [customer]);

  const orders = useQuery({ queryKey: ["customer-orders", customer?.id], queryFn: () => api.customerOrders(token ?? ""), enabled: Boolean(token) && activityTab === "orders" });
  const serviceEnquiries = useQuery({ queryKey: ["customer-service-enquiries", customer?.id], queryFn: () => api.customerServiceEnquiries(token ?? ""), enabled: Boolean(token) && activityTab === "services" });
  const investmentInterests = useQuery({ queryKey: ["customer-investment-interests", customer?.id], queryFn: () => api.customerInvestmentInterests(token ?? ""), enabled: Boolean(token) && activityTab === "investments" });
  const saveProfile = useMutation({
    mutationFn: () => api.updateCustomerProfile(token ?? "", name),
    onSuccess: (updated) => { if (token) setSession({ accessToken: token, customer: updated }); }
  });
  const resend = useMutation({ mutationFn: () => api.resendVerification(token ?? "") });

  if (!ready) return <main><SiteHeader /><div className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-4 py-12"><div className="h-96 rounded-lg bg-forest-50" /></div></main>;
  if (!customer || !token) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] place-items-center px-4 text-center"><div><UserRound className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Sign in to view your account</h1><Link href="/login?returnTo=%2Faccount" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Sign in</Link></div></section></main>;

  function submitProfile(event: FormEvent<HTMLFormElement>) { event.preventDefault(); saveProfile.mutate(); }

  const activeQuery = activityTab === "orders" ? orders : activityTab === "services" ? serviceEnquiries : investmentInterests;

  return <main><SiteHeader /><section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase text-forest-600">Buyer account</p><h1 className="mt-1 text-4xl font-black text-forest-950">Welcome, {customer.name.split(" ")[0]}</h1><p className="mt-2 text-slate-600">Manage your profile and follow orders, enquiries, and opportunities.</p></div><button type="button" onClick={() => { signOut(); router.replace("/"); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 font-bold text-slate-700"><LogOut size={18} aria-hidden="true" /> Sign out</button></div>

    {!customer.emailVerified ? <div className="mt-6 flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><MailWarning className="mt-0.5 shrink-0 text-amber-800" size={22} aria-hidden="true" /><div><h2 className="font-black text-amber-950">Verify your email before submitting requests</h2><p className="mt-1 text-sm text-amber-900">We sent the verification link to {customer.email}.</p></div></div><button type="button" onClick={() => resend.mutate()} disabled={resend.isPending || resend.isSuccess} className="min-h-11 rounded-md bg-amber-900 px-4 font-black text-white disabled:opacity-50">{resend.isSuccess ? "Email sent" : resend.isPending ? "Sending..." : "Resend email"}</button></div> : null}

    <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
      <form onSubmit={submitProfile} className="rounded-lg border border-forest-100 bg-white p-6 shadow-line"><UserRound className="text-forest-600" size={28} aria-hidden="true" /><h2 className="mt-3 text-2xl font-black text-forest-950">Profile</h2><label className="mt-5 block text-sm font-bold text-forest-950">Full name<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal" /></label><label className="mt-4 block text-sm font-bold text-forest-950">Email<input readOnly value={customer.email} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal text-slate-600" /></label>{saveProfile.isSuccess ? <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-forest-700"><CheckCircle2 size={16} aria-hidden="true" /> Profile updated</p> : null}{saveProfile.isError ? <p role="alert" className="mt-3 text-sm font-bold text-red-700">{saveProfile.error instanceof ApiError ? saveProfile.error.message : "Could not update profile."}</p> : null}<button disabled={saveProfile.isPending || name.trim() === customer.name} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Save size={17} aria-hidden="true" /> {saveProfile.isPending ? "Saving..." : "Save profile"}</button></form>

      <section aria-labelledby="account-activity-heading"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase text-forest-600">Account activity</p><h2 id="account-activity-heading" className="mt-1 text-3xl font-black text-forest-950">Your requests</h2></div><button type="button" onClick={() => activeQuery.refetch()} disabled={activeQuery.isFetching} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-bold disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" /> Refresh</button></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3" role="group" aria-label="Account activity view">
          {activityTabs.map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={activityTab === value} onClick={() => setActivityTab(value)} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-3 text-sm font-black ${activityTab === value ? "bg-forest-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><Icon size={17} aria-hidden="true" />{label}</button>)}
        </div>

        {activeQuery.isLoading ? <div className="mt-5 h-64 animate-pulse rounded-lg bg-forest-50" role="status"><span className="sr-only">Loading account activity</span></div> : null}
        {activeQuery.isError ? <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-5"><p className="font-bold text-red-800">Could not load this account activity.</p><button type="button" onClick={() => activeQuery.refetch()} className="mt-3 min-h-11 rounded-md bg-forest-600 px-4 font-black text-white">Try again</button></div> : null}

        {activityTab === "orders" && !orders.isLoading && !orders.isError && !orders.data?.length ? <EmptyActivity icon={PackageOpen} title="No orders yet" copy="Products you check out will appear here." href="/marketplace" action="Browse marketplace" /> : null}
        {activityTab === "services" && !serviceEnquiries.isLoading && !serviceEnquiries.isError && !serviceEnquiries.data?.length ? <EmptyActivity icon={Wrench} title="No service enquiries yet" copy="Your submitted service requests will appear here." href="/services" action="Browse services" /> : null}
        {activityTab === "investments" && !investmentInterests.isLoading && !investmentInterests.isError && !investmentInterests.data?.length ? <EmptyActivity icon={Landmark} title="No expressions of interest yet" copy="Your non-binding opportunity enquiries will appear here." href="/invest" action="Explore opportunities" /> : null}

        {activityTab === "orders" ? <div className="mt-5 space-y-4">{orders.data?.map((order) => <article key={order.id} className="rounded-lg border border-forest-100 bg-white p-5 shadow-line"><ActivityHeading title={order.orderNumber} status={order.status} date={order.createdAt} /><div className="mt-4 space-y-3">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3"><div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-forest-50"><Image src={item.product.imageUrl} alt="" fill sizes="56px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="font-bold text-forest-950">{item.product.name}</p><p className="text-sm text-slate-600">{item.quantity} x {formatNaira(item.unitPrice)}</p></div></div>)}</div><div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-black text-forest-950"><span>Total</span><span>{formatNaira(order.subtotal)}</span></div></article>)}</div> : null}

        {activityTab === "services" ? <div className="mt-5 space-y-4">{serviceEnquiries.data?.map((enquiry) => <article key={enquiry.id} className="rounded-lg border border-forest-100 bg-white p-5 shadow-line"><ActivityHeading title={enquiry.service.title} status={enquiry.status} date={enquiry.createdAt} updatedAt={enquiry.updatedAt} /><p className="mt-3 text-sm font-bold text-forest-700">{enquiry.service.providerName}{enquiry.service.location ? ` · ${enquiry.service.location}` : ""}</p><p className="mt-1 text-sm text-slate-500">Contact number: {enquiry.phone}</p><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{enquiry.message}</p><Link href={`/services/${enquiry.service.slug}`} className="mt-4 inline-flex min-h-11 items-center font-black text-forest-700">View service</Link></article>)}</div> : null}

        {activityTab === "investments" ? <div className="mt-5 space-y-4">{investmentInterests.data?.map((interest) => <article key={interest.id} className="rounded-lg border border-forest-100 bg-white p-5 shadow-line"><ActivityHeading title={interest.opportunity.title} status={interest.status} date={interest.createdAt} updatedAt={interest.updatedAt} /><p className="mt-3 text-sm font-bold text-forest-700">{interest.investorType.replaceAll("_", " ")}{interest.indicativeAmount ? ` · ${formatNaira(interest.indicativeAmount)} indicative interest` : ""}</p><p className="mt-1 text-sm text-slate-500">{interest.organizationName ? `${interest.organizationName} · ` : ""}{interest.opportunity.location ? `${interest.opportunity.location} · ` : ""}{interest.phone}</p><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{interest.message}</p><p className="mt-3 text-xs font-bold text-slate-500">This expression is non-binding and does not reserve investment rights.</p><Link href={`/invest/${interest.opportunity.slug}`} className="mt-4 inline-flex min-h-11 items-center font-black text-forest-700">View opportunity</Link></article>)}</div> : null}
      </section>
    </div>
  </section></main>;
}

function ActivityHeading({ title, status, date, updatedAt }: { title: string; status: string; date: string; updatedAt?: string }) {
  const changed = updatedAt && new Date(updatedAt).getTime() > new Date(date).getTime() + 1000;
  return <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-forest-600">Submitted {new Date(date).toLocaleDateString("en-NG", { dateStyle: "medium" })}{changed ? ` · Updated ${new Date(updatedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}` : ""}</p><h3 className="mt-1 text-xl font-black text-forest-950">{title}</h3></div><span className="rounded-full bg-forest-50 px-3 py-1 text-sm font-black text-forest-800">{status.replaceAll("_", " ")}</span></div>;
}

function EmptyActivity({ icon: Icon, title, copy, href, action }: { icon: typeof PackageOpen; title: string; copy: string; href: string; action: string }) {
  return <div className="mt-5 rounded-lg border border-forest-100 bg-white p-10 text-center"><Icon className="mx-auto text-forest-600" size={40} aria-hidden="true" /><h3 className="mt-3 text-xl font-black text-forest-950">{title}</h3><p className="mt-2 text-slate-600">{copy}</p><Link href={href} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">{action}</Link></div>;
}

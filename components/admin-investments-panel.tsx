"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Edit3, Inbox, Landmark, Plus, RotateCcw, Save, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { ApiError, api, formatNaira, type AdminInvestmentFormPayload } from "@/lib/api";
import type { InvestmentCategory, InvestmentInterestStatus, InvestmentOpportunity } from "@/lib/types";
import { investmentCategoryDetails } from "@/components/investment-card";
import { AdminImageUpload } from "@/components/admin-image-upload";

const categories = Object.keys(investmentCategoryDetails) as InvestmentCategory[];
const statuses: InvestmentInterestStatus[] = ["NEW", "IN_REVIEW", "CONTACTED", "CLOSED"];
const emptyOpportunity: AdminInvestmentFormPayload = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "FARMING_SEASON",
  location: "Nigeria",
  imageUrl: "",
  fundingTarget: undefined,
  minimumInterestAmount: undefined,
  durationMonths: undefined,
  riskSummary: "Agricultural projects involve operational, market, climate, and execution risks. Details remain subject to verification and formal documentation.",
  featured: false,
  openForInterest: true,
  published: false
};

export function AdminInvestmentsPanel({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminInvestmentFormPayload>(emptyOpportunity);
  const [interestNotes, setInterestNotes] = useState<Record<string, string>>({});
  const [interestSearch, setInterestSearch] = useState("");
  const [interestStatus, setInterestStatus] = useState<InvestmentInterestStatus | "ALL">("ALL");
  const opportunities = useQuery({ queryKey: ["admin-investments", token], queryFn: () => api.adminInvestments(token) });
  const interests = useQuery({ queryKey: ["admin-investment-interests", token], queryFn: () => api.adminInvestmentInterests(token) });
  const saveOpportunity = useMutation({
    mutationFn: () => editingId ? api.updateAdminInvestment(token, editingId, form) : api.createAdminInvestment(token, form),
    onSuccess: async () => {
      setEditingId(null);
      setForm(emptyOpportunity);
      await queryClient.invalidateQueries({ queryKey: ["admin-investments", token] });
    }
  });
  const archiveOpportunity = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) => api.setAdminInvestmentArchived(token, id, archived),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["admin-investments", token] })
  });
  const updateInterest = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: InvestmentInterestStatus; notes: string }) => api.updateAdminInvestmentInterest(token, id, status, notes),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-investment-interests", token] }),
      queryClient.invalidateQueries({ queryKey: ["admin-stats", token] })
    ])
  });
  const filteredInterests = useMemo(() => {
    const search = interestSearch.trim().toLowerCase();
    return (interests.data ?? []).filter((interest) => {
      const matchesStatus = interestStatus === "ALL" || interest.status === interestStatus;
      const matchesSearch = !search || [interest.opportunity.title, interest.customer.name, interest.customer.email, interest.phone, interest.organizationName ?? ""]
        .some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [interestSearch, interestStatus, interests.data]);

  function editOpportunity(opportunity: InvestmentOpportunity) {
    setEditingId(opportunity.id);
    setForm({
      title: opportunity.title,
      slug: opportunity.slug,
      summary: opportunity.summary,
      description: opportunity.description,
      category: opportunity.category,
      location: opportunity.location ?? "",
      imageUrl: opportunity.imageUrl ?? "",
      fundingTarget: opportunity.fundingTarget ?? undefined,
      minimumInterestAmount: opportunity.minimumInterestAmount ?? undefined,
      durationMonths: opportunity.durationMonths ?? undefined,
      riskSummary: opportunity.riskSummary,
      featured: opportunity.featured,
      openForInterest: opportunity.openForInterest,
      published: Boolean(opportunity.publishedAt)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <div className="mt-6 space-y-6">
    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <OpportunityForm token={token} form={form} editingId={editingId} pending={saveOpportunity.isPending} error={saveOpportunity.isError ? (saveOpportunity.error instanceof ApiError ? saveOpportunity.error.message : "Could not save this opportunity.") : undefined} onChange={setForm} onSubmit={(event) => { event.preventDefault(); saveOpportunity.mutate(); }} onCancel={() => { setEditingId(null); setForm(emptyOpportunity); }} />
      <section className="rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black text-forest-950">Opportunity catalogue</h2><p className="mt-1 text-sm text-slate-600">Manage public details, interest availability, drafts, and archived opportunities.</p></div><div className="divide-y divide-slate-100">{(opportunities.data ?? []).map((opportunity) => <article key={opportunity.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-forest-950">{opportunity.title}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${opportunity.archivedAt ? "bg-slate-100 text-slate-700" : opportunity.publishedAt ? "bg-forest-50 text-forest-800" : "bg-amber-100 text-amber-900"}`}>{opportunity.archivedAt ? "Archived" : opportunity.publishedAt ? "Published" : "Draft"}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{opportunity.openForInterest ? "Interest open" : "Interest paused"}</span></div><p className="mt-1 text-sm font-bold text-forest-600">{investmentCategoryDetails[opportunity.category].label}{opportunity.location ? ` · ${opportunity.location}` : ""}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{opportunity.summary}</p><p className="mt-2 text-xs font-bold text-slate-500">{opportunity._count?.interests ?? 0} expressions of interest{opportunity.fundingTarget ? ` · ${formatNaira(opportunity.fundingTarget)} indicative target` : ""}</p></div><div className="flex gap-2"><button type="button" onClick={() => editOpportunity(opportunity)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold"><Edit3 size={16} aria-hidden="true" /> Edit</button><button type="button" onClick={() => archiveOpportunity.mutate({ id: opportunity.id, archived: !opportunity.archivedAt })} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm font-bold text-slate-700">{opportunity.archivedAt ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}{opportunity.archivedAt ? "Restore" : "Archive"}</button></div></article>)}{opportunities.isLoading ? <p className="p-5 text-slate-600">Loading opportunities...</p> : null}{opportunities.isError ? <p className="p-5 font-bold text-red-700">Could not load opportunities.</p> : null}{!opportunities.isLoading && !opportunities.data?.length ? <p className="p-5 text-slate-600">No opportunities yet. Create the first draft.</p> : null}</div></section>
    </div>

    <section className="rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><div className="flex items-center gap-3"><Inbox className="text-forest-600" size={24} aria-hidden="true" /><div><h2 className="text-xl font-black text-forest-950">Expressions of interest</h2><p className="mt-1 text-sm text-slate-600">Review prospective interest and record non-public follow-up notes.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end"><label className="block text-sm font-bold text-forest-950">Search expressions<div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" /><input type="search" value={interestSearch} onChange={(event) => setInterestSearch(event.target.value)} placeholder="Name, email, phone, or opportunity" className="min-h-11 w-full rounded-md border border-slate-200 pl-10 pr-3 font-normal" /></div></label><label className="block text-sm font-bold text-forest-950">Status<select value={interestStatus} onChange={(event) => setInterestStatus(event.target.value as InvestmentInterestStatus | "ALL")} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal"><option value="ALL">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label><p className="pb-3 text-sm font-bold text-slate-500" aria-live="polite">{filteredInterests.length} shown</p></div>{updateInterest.isError ? <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{updateInterest.error instanceof ApiError ? updateInterest.error.message : "Could not update this expression of interest."}</p> : null}</div><div className="divide-y divide-slate-100">{filteredInterests.map((interest) => <article key={interest.id} className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-forest-950">{interest.opportunity.title}</h3><span className="rounded-full bg-forest-50 px-2 py-1 text-xs font-black text-forest-800">{interest.status.replace("_", " ")}</span></div><p className="mt-2 text-sm font-bold text-slate-700">{interest.customer.name} · {interest.customer.email} · {interest.phone}</p><p className="mt-1 text-sm text-slate-600">{interest.investorType.replace("_", " ")}{interest.organizationName ? ` · ${interest.organizationName}` : ""}{interest.indicativeAmount ? ` · ${formatNaira(interest.indicativeAmount)} indicative` : ""}</p><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{interest.message}</p><p className="mt-3 text-xs font-bold text-slate-500">Received {new Date(interest.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p></div><div className="space-y-3"><label className="block text-sm font-bold text-forest-950">Status<select id={`interest-status-${interest.id}`} defaultValue={interest.status} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3">{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label><label className="block text-sm font-bold text-forest-950">Internal notes<textarea value={interestNotes[interest.id] ?? interest.adminNotes ?? ""} onChange={(event) => setInterestNotes((current) => ({ ...current, [interest.id]: event.target.value }))} className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" placeholder="Verification, ownership, next step..." /></label><button type="button" disabled={updateInterest.isPending} onClick={() => { const select = document.getElementById(`interest-status-${interest.id}`) as HTMLSelectElement | null; updateInterest.mutate({ id: interest.id, status: (select?.value ?? interest.status) as InvestmentInterestStatus, notes: interestNotes[interest.id] ?? interest.adminNotes ?? "" }); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 text-sm font-black text-white disabled:opacity-50"><Save size={16} aria-hidden="true" /> Save follow-up</button></div></article>)}{interests.isLoading ? <p className="p-5 text-slate-600">Loading expressions of interest...</p> : null}{interests.isError ? <p className="p-5 font-bold text-red-700">Could not load expressions of interest.</p> : null}{!interests.isLoading && !interests.data?.length ? <p className="p-5 text-slate-600">No expressions of interest yet.</p> : null}{!interests.isLoading && Boolean(interests.data?.length) && !filteredInterests.length ? <p className="p-5 text-slate-600">No expressions match these filters.</p> : null}</div></section>
  </div>;
}

function OpportunityForm({ token, form, editingId, pending, error, onChange, onSubmit, onCancel }: { token: string; form: AdminInvestmentFormPayload; editingId: string | null; pending: boolean; error?: string; onChange: (value: AdminInvestmentFormPayload) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  function setField<K extends keyof AdminInvestmentFormPayload>(key: K, value: AdminInvestmentFormPayload[K]) { onChange({ ...form, [key]: value }); }
  return <form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={onSubmit}><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-md bg-forest-600 text-white">{editingId ? <Landmark size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}</div><div><h2 className="text-xl font-black text-forest-950">{editingId ? "Edit opportunity" : "New opportunity"}</h2><p className="text-sm text-slate-600">Keep claims factual and clearly preliminary.</p></div></div><div className="mt-5 grid gap-4"><label className="block text-sm font-bold text-forest-950">Category<select value={form.category} onChange={(event) => setField("category", event.target.value as InvestmentCategory)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3">{categories.map((category) => <option key={category} value={category}>{investmentCategoryDetails[category].label}</option>)}</select></label><Field label="Title" value={form.title} onChange={(value) => setField("title", value)} /><Field label="Slug" value={form.slug} onChange={(value) => setField("slug", value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} /><Area label="Summary" minLength={20} maxLength={360} value={form.summary} onChange={(value) => setField("summary", value)} /><Area label="Full description" minLength={40} maxLength={12000} value={form.description} onChange={(value) => setField("description", value)} large /><Field label="Location" required={false} value={form.location ?? ""} onChange={(value) => setField("location", value)} /><AdminImageUpload token={token} scope="opportunities" value={form.imageUrl} onChange={(value) => setField("imageUrl", value)} /><div className="grid gap-4 sm:grid-cols-3"><NumberField label="Indicative target" value={form.fundingTarget} onChange={(value) => setField("fundingTarget", value)} /><NumberField label="Indicative minimum" value={form.minimumInterestAmount} onChange={(value) => setField("minimumInterestAmount", value)} /><NumberField label="Duration in months" value={form.durationMonths} onChange={(value) => setField("durationMonths", value)} /></div><Area label="Risk summary" minLength={20} maxLength={2000} value={form.riskSummary} onChange={(value) => setField("riskSummary", value)} /><div className="grid gap-3 sm:grid-cols-3"><Toggle label="Featured" checked={form.featured} onChange={(value) => setField("featured", value)} /><Toggle label="Interest open" checked={form.openForInterest} onChange={(value) => setField("openForInterest", value)} /><Toggle label="Published" checked={form.published} onChange={(value) => setField("published", value)} /></div>{error ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}</div><div className="mt-5 flex gap-2"><button type="submit" disabled={pending} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Save size={17} aria-hidden="true" />{pending ? "Saving..." : form.published ? "Save and publish" : "Save draft"}</button>{editingId ? <button type="button" onClick={onCancel} className="min-h-11 rounded-md border border-slate-200 px-4 font-bold">Cancel</button> : null}</div></form>;
}

function Field({ label, value, onChange, type = "text", required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm font-bold text-forest-950">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /></label>; }
function Area({ label, value, onChange, minLength, maxLength, large = false }: { label: string; value: string; onChange: (value: string) => void; minLength: number; maxLength: number; large?: boolean }) { return <label className="block text-sm font-bold text-forest-950">{label}<textarea required minLength={minLength} maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} className={`mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-normal ${large ? "min-h-48" : "min-h-28"}`} /></label>; }
function NumberField({ label, value, onChange }: { label: string; value?: number | null; onChange: (value: number | undefined) => void }) { return <label className="block text-sm font-bold text-forest-950">{label}<input type="number" min={1} value={value ?? ""} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>; }

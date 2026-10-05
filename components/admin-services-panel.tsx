"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Edit3, Inbox, Plus, RotateCcw, Save, Search, Wrench } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { ApiError, api, type AdminServiceFormPayload } from "@/lib/api";
import type { ServiceCategory, ServiceEnquiryStatus, ServiceListing } from "@/lib/types";
import { serviceCategoryDetails } from "@/components/service-card";
import { AdminImageUpload } from "@/components/admin-image-upload";

const categories = Object.keys(serviceCategoryDetails) as ServiceCategory[];
const statuses: ServiceEnquiryStatus[] = ["NEW", "IN_REVIEW", "CONTACTED", "CLOSED"];
const emptyService: AdminServiceFormPayload = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "EQUIPMENT_RENTAL",
  providerName: "ZD Crown partner network",
  location: "Nigeria",
  imageUrl: "",
  featured: false,
  published: false
};

export function AdminServicesPanel({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminServiceFormPayload>(emptyService);
  const [enquiryNotes, setEnquiryNotes] = useState<Record<string, string>>({});
  const [enquirySearch, setEnquirySearch] = useState("");
  const [enquiryStatus, setEnquiryStatus] = useState<ServiceEnquiryStatus | "ALL">("ALL");
  const services = useQuery({ queryKey: ["admin-services", token], queryFn: () => api.adminServices(token) });
  const enquiries = useQuery({ queryKey: ["admin-service-enquiries", token], queryFn: () => api.adminServiceEnquiries(token) });
  const saveService = useMutation({
    mutationFn: () => editingId ? api.updateAdminService(token, editingId, form) : api.createAdminService(token, form),
    onSuccess: async () => {
      setEditingId(null);
      setForm(emptyService);
      await queryClient.invalidateQueries({ queryKey: ["admin-services", token] });
    }
  });
  const archiveService = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) => api.setAdminServiceArchived(token, id, archived),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["admin-services", token] })
  });
  const updateEnquiry = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ServiceEnquiryStatus; notes: string }) => api.updateAdminServiceEnquiry(token, id, status, notes),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-service-enquiries", token] }),
      queryClient.invalidateQueries({ queryKey: ["admin-stats", token] })
    ])
  });
  const filteredEnquiries = useMemo(() => {
    const search = enquirySearch.trim().toLowerCase();
    return (enquiries.data ?? []).filter((enquiry) => {
      const matchesStatus = enquiryStatus === "ALL" || enquiry.status === enquiryStatus;
      const matchesSearch = !search || [enquiry.service.title, enquiry.customer.name, enquiry.customer.email, enquiry.phone]
        .some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [enquiries.data, enquirySearch, enquiryStatus]);

  function editService(service: ServiceListing) {
    setEditingId(service.id);
    setForm({
      title: service.title,
      slug: service.slug,
      summary: service.summary,
      description: service.description,
      category: service.category,
      providerName: service.providerName,
      location: service.location ?? "",
      imageUrl: service.imageUrl ?? "",
      featured: service.featured,
      published: Boolean(service.publishedAt)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <div className="mt-6 space-y-6">
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <ServiceForm token={token} form={form} editingId={editingId} pending={saveService.isPending} error={saveService.isError ? (saveService.error instanceof ApiError ? saveService.error.message : "Could not save this service.") : undefined} onChange={setForm} onSubmit={(event) => { event.preventDefault(); saveService.mutate(); }} onCancel={() => { setEditingId(null); setForm(emptyService); }} />
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black text-forest-950">Service directory</h2><p className="mt-1 text-sm text-slate-600">Manage drafts, public listings, featured services, and archives.</p></div>
        <div className="divide-y divide-slate-100">
          {(services.data ?? []).map((service) => <article key={service.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-forest-950">{service.title}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${service.archivedAt ? "bg-slate-100 text-slate-700" : service.publishedAt ? "bg-forest-50 text-forest-800" : "bg-amber-100 text-amber-900"}`}>{service.archivedAt ? "Archived" : service.publishedAt ? "Published" : "Draft"}</span>{service.featured ? <span className="rounded-full bg-harvest-100 px-2 py-1 text-xs font-black text-forest-950">Featured</span> : null}</div><p className="mt-1 text-sm font-bold text-forest-600">{serviceCategoryDetails[service.category].label} · {service.providerName}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{service.summary}</p><p className="mt-2 text-xs font-bold text-slate-500">{service._count?.enquiries ?? 0} enquiries</p></div><div className="flex gap-2"><button type="button" onClick={() => editService(service)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold"><Edit3 size={16} aria-hidden="true" /> Edit</button><button type="button" onClick={() => archiveService.mutate({ id: service.id, archived: !service.archivedAt })} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm font-bold text-slate-700">{service.archivedAt ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}{service.archivedAt ? "Restore" : "Archive"}</button></div></article>)}
          {services.isLoading ? <p className="p-5 text-slate-600">Loading services...</p> : null}
          {services.isError ? <p className="p-5 font-bold text-red-700">Could not load services.</p> : null}
          {!services.isLoading && !services.data?.length ? <p className="p-5 text-slate-600">No service listings yet. Create the first draft.</p> : null}
        </div>
      </section>
    </div>

    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5"><div className="flex items-center gap-3"><Inbox className="text-forest-600" size={24} aria-hidden="true" /><div><h2 className="text-xl font-black text-forest-950">Customer enquiries</h2><p className="mt-1 text-sm text-slate-600">Review requests, record follow-up notes, and keep their status current.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end"><label className="block text-sm font-bold text-forest-950">Search enquiries<div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" /><input type="search" value={enquirySearch} onChange={(event) => setEnquirySearch(event.target.value)} placeholder="Name, email, phone, or service" className="min-h-11 w-full rounded-md border border-slate-200 pl-10 pr-3 font-normal" /></div></label><label className="block text-sm font-bold text-forest-950">Status<select value={enquiryStatus} onChange={(event) => setEnquiryStatus(event.target.value as ServiceEnquiryStatus | "ALL")} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal"><option value="ALL">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label><p className="pb-3 text-sm font-bold text-slate-500" aria-live="polite">{filteredEnquiries.length} shown</p></div>{updateEnquiry.isError ? <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{updateEnquiry.error instanceof ApiError ? updateEnquiry.error.message : "Could not update this enquiry."}</p> : null}</div>
      <div className="divide-y divide-slate-100">
        {filteredEnquiries.map((enquiry) => <article key={enquiry.id} className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-forest-950">{enquiry.service.title}</h3><span className="rounded-full bg-forest-50 px-2 py-1 text-xs font-black text-forest-800">{enquiry.status.replace("_", " ")}</span></div><p className="mt-2 text-sm font-bold text-slate-700">{enquiry.customer.name} · {enquiry.customer.email} · {enquiry.phone}</p><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{enquiry.message}</p><p className="mt-3 text-xs font-bold text-slate-500">Received {new Date(enquiry.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p></div><div className="space-y-3"><label className="block text-sm font-bold text-forest-950">Status<select id={`enquiry-status-${enquiry.id}`} defaultValue={enquiry.status} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3">{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label><label className="block text-sm font-bold text-forest-950">Internal notes<textarea value={enquiryNotes[enquiry.id] ?? enquiry.adminNotes ?? ""} onChange={(event) => setEnquiryNotes((current) => ({ ...current, [enquiry.id]: event.target.value }))} className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" placeholder="Call outcome, ownership, next step..." /></label><button type="button" disabled={updateEnquiry.isPending} onClick={() => { const select = document.getElementById(`enquiry-status-${enquiry.id}`) as HTMLSelectElement | null; updateEnquiry.mutate({ id: enquiry.id, status: (select?.value ?? enquiry.status) as ServiceEnquiryStatus, notes: enquiryNotes[enquiry.id] ?? enquiry.adminNotes ?? "" }); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 text-sm font-black text-white disabled:opacity-50"><Save size={16} aria-hidden="true" /> Save follow-up</button></div></article>)}
        {enquiries.isLoading ? <p className="p-5 text-slate-600">Loading enquiries...</p> : null}
        {enquiries.isError ? <p className="p-5 font-bold text-red-700">Could not load enquiries.</p> : null}
        {!enquiries.isLoading && !enquiries.data?.length ? <p className="p-5 text-slate-600">No customer enquiries yet.</p> : null}
        {!enquiries.isLoading && Boolean(enquiries.data?.length) && !filteredEnquiries.length ? <p className="p-5 text-slate-600">No enquiries match these filters.</p> : null}
      </div>
    </section>
  </div>;
}

function ServiceForm({ token, form, editingId, pending, error, onChange, onSubmit, onCancel }: { token: string; form: AdminServiceFormPayload; editingId: string | null; pending: boolean; error?: string; onChange: (value: AdminServiceFormPayload) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  function setField<K extends keyof AdminServiceFormPayload>(key: K, value: AdminServiceFormPayload[K]) { onChange({ ...form, [key]: value }); }
  return <form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={onSubmit}><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-md bg-forest-600 text-white">{editingId ? <Wrench size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}</div><div><h2 className="text-xl font-black text-forest-950">{editingId ? "Edit service" : "New service"}</h2><p className="text-sm text-slate-600">Publish clear, verifiable service information.</p></div></div><div className="mt-5 grid gap-4"><label className="block text-sm font-bold text-forest-950">Category<select value={form.category} onChange={(event) => setField("category", event.target.value as ServiceCategory)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3">{categories.map((category) => <option key={category} value={category}>{serviceCategoryDetails[category].label}</option>)}</select></label><Field label="Title" value={form.title} onChange={(value) => setField("title", value)} /><Field label="Slug" value={form.slug} onChange={(value) => setField("slug", value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} /><label className="block text-sm font-bold text-forest-950">Summary<textarea required minLength={20} maxLength={360} value={form.summary} onChange={(event) => setField("summary", event.target.value)} className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" /></label><label className="block text-sm font-bold text-forest-950">Full description<textarea required minLength={40} maxLength={12000} value={form.description} onChange={(event) => setField("description", event.target.value)} className="mt-1 min-h-48 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" /></label><Field label="Provider name" value={form.providerName} onChange={(value) => setField("providerName", value)} /><Field label="Location" required={false} value={form.location ?? ""} onChange={(value) => setField("location", value)} /><AdminImageUpload token={token} scope="services" value={form.imageUrl} onChange={(value) => setField("imageUrl", value)} /><div className="grid gap-3 sm:grid-cols-2"><Toggle label="Featured" checked={form.featured} onChange={(value) => setField("featured", value)} /><Toggle label="Published" checked={form.published} onChange={(value) => setField("published", value)} /></div>{error ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}</div><div className="mt-5 flex gap-2"><button type="submit" disabled={pending} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Save size={17} aria-hidden="true" />{pending ? "Saving..." : form.published ? "Save and publish" : "Save draft"}</button>{editingId ? <button type="button" onClick={onCancel} className="min-h-11 rounded-md border border-slate-200 px-4 font-bold">Cancel</button> : null}</div></form>;
}

function Field({ label, value, onChange, type = "text", required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm font-bold text-forest-950">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" /></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>; }

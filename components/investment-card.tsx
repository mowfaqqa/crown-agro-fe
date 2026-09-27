import { ArrowRight, CalendarDays, Factory, MapPin, PackageOpen, Sprout, Tractor, Warehouse, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/api";
import type { InvestmentCategory, InvestmentOpportunity } from "@/lib/types";

export const investmentCategoryDetails: Record<InvestmentCategory, { label: string; Icon: LucideIcon }> = {
  FARMING_SEASON: { label: "Farming seasons", Icon: Sprout },
  FRESH_PRODUCE: { label: "Fresh produce", Icon: Tractor },
  GRAINS: { label: "Grains", Icon: Wheat },
  LIVESTOCK: { label: "Livestock", Icon: Tractor },
  EXPORT_LOGISTICS: { label: "Export logistics", Icon: PackageOpen },
  WAREHOUSING: { label: "Warehousing", Icon: Warehouse },
  PROCESSING: { label: "Processing", Icon: Factory }
};

export function InvestmentCard({ opportunity, priority = false }: { opportunity: InvestmentOpportunity; priority?: boolean }) {
  const details = investmentCategoryDetails[opportunity.category];
  return <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-forest-100 bg-white shadow-line transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
    {opportunity.imageUrl ? <div className="relative aspect-[16/9] overflow-hidden bg-forest-50"><Image src={opportunity.imageUrl} alt="" fill priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div> : <div className="grid aspect-[16/9] place-items-center bg-forest-50"><details.Icon size={44} className="text-forest-500" aria-hidden="true" /></div>}
    <div className="flex flex-1 flex-col p-5"><div className="flex flex-wrap items-center gap-2 text-sm font-bold text-forest-700"><span className="inline-flex items-center gap-1.5"><details.Icon size={17} aria-hidden="true" />{details.label}</span>{opportunity.featured ? <span className="rounded-full bg-harvest-100 px-2 py-1 text-xs text-forest-950">Featured</span> : null}<span className={`rounded-full px-2 py-1 text-xs ${opportunity.openForInterest ? "bg-forest-50 text-forest-800" : "bg-slate-100 text-slate-700"}`}>{opportunity.openForInterest ? "Open for interest" : "Interest paused"}</span></div><h2 className="mt-3 text-xl font-black leading-snug text-forest-950">{opportunity.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{opportunity.summary}</p><div className="mt-4 grid grid-cols-2 gap-3 border-y border-forest-100 py-4 text-sm">{opportunity.fundingTarget ? <div><span className="block text-xs font-bold text-slate-500">Indicative target</span><span className="mt-1 block font-black text-forest-950">{formatNaira(opportunity.fundingTarget)}</span></div> : null}{opportunity.durationMonths ? <div><span className="block text-xs font-bold text-slate-500">Estimated duration</span><span className="mt-1 inline-flex items-center gap-1 font-black text-forest-950"><CalendarDays size={15} aria-hidden="true" />{opportunity.durationMonths} months</span></div> : null}</div><div className="mt-auto flex items-end justify-between gap-3 pt-5"><div className="text-xs font-semibold text-slate-500">{opportunity.location ? <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden="true" />{opportunity.location}</span> : <span>Nigeria</span>}</div><Link href={`/invest/${opportunity.slug}`} className="inline-grid size-11 shrink-0 place-items-center rounded-md bg-forest-600 text-white transition group-hover:bg-forest-700" aria-label={`View ${opportunity.title}`}><ArrowRight size={18} aria-hidden="true" /></Link></div></div>
  </article>;
}

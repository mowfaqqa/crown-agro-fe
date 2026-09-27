import { ArrowRight, BriefcaseBusiness, GraduationCap, Handshake, MapPin, PackageOpen, Tractor, Warehouse, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ServiceCategory, ServiceListing } from "@/lib/types";

export const serviceCategoryDetails: Record<ServiceCategory, { label: string; Icon: LucideIcon }> = {
  EQUIPMENT_RENTAL: { label: "Equipment rentals", Icon: Tractor },
  JOB_BOARD: { label: "Job board", Icon: BriefcaseBusiness },
  TRAINING: { label: "Training & courses", Icon: GraduationCap },
  EXPORT_LOGISTICS: { label: "Export & logistics", Icon: PackageOpen },
  INPUT_SUPPLY: { label: "Input suppliers", Icon: PackageOpen },
  WAREHOUSING: { label: "Warehousing", Icon: Warehouse },
  SMART_FARMING: { label: "Smart farming", Icon: Wifi },
  COMMUNITY: { label: "Community", Icon: Handshake }
};

export function ServiceCard({ service, priority = false }: { service: ServiceListing; priority?: boolean }) {
  const details = serviceCategoryDetails[service.category];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-forest-100 bg-white shadow-line transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      {service.imageUrl ? <div className="relative aspect-[16/9] overflow-hidden bg-forest-50"><Image src={service.imageUrl} alt="" fill priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div> : <div className="grid aspect-[16/9] place-items-center bg-forest-50"><details.Icon size={44} className="text-forest-500" aria-hidden="true" /></div>}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-forest-700"><span className="inline-flex items-center gap-1.5"><details.Icon size={17} aria-hidden="true" />{details.label}</span>{service.featured ? <span className="rounded-full bg-harvest-100 px-2 py-1 text-xs text-forest-950">Featured</span> : null}</div>
        <h2 className="mt-3 text-xl font-black leading-snug text-forest-950">{service.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{service.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5"><div className="text-xs font-semibold text-slate-500"><span className="block text-sm font-black text-forest-900">{service.providerName}</span>{service.location ? <span className="mt-1 inline-flex items-center gap-1"><MapPin size={14} aria-hidden="true" />{service.location}</span> : null}</div><Link href={`/services/${service.slug}`} className="inline-grid size-11 shrink-0 place-items-center rounded-md bg-forest-600 text-white transition group-hover:bg-forest-700" aria-label={`View ${service.title}`}><ArrowRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </article>
  );
}

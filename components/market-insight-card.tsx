import { ArrowRight, CloudSun, MapPin, Newspaper, Ship, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MarketInsight, MarketInsightType } from "@/lib/types";

export const insightTypeDetails: Record<MarketInsightType, { label: string; shortLabel: string; Icon: LucideIcon }> = {
  COMMODITY_PRICE: { label: "Commodity prices", shortLabel: "Prices", Icon: TrendingUp },
  AGRICULTURE_NEWS: { label: "Agriculture news", shortLabel: "News", Icon: Newspaper },
  EXPORT_OPPORTUNITY: { label: "Export opportunities", shortLabel: "Export", Icon: Ship },
  WEATHER_ADVISORY: { label: "Weather advisories", shortLabel: "Weather", Icon: CloudSun }
};

export function MarketInsightCard({ insight, priority = false }: { insight: MarketInsight; priority?: boolean }) {
  const details = insightTypeDetails[insight.type];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-forest-100 bg-white shadow-line transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      {insight.imageUrl ? <div className="relative aspect-[16/9] overflow-hidden bg-forest-50"><Image src={insight.imageUrl} alt="" fill priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div> : <div className="grid aspect-[16/9] place-items-center bg-forest-50"><details.Icon size={42} className="text-forest-500" aria-hidden="true" /></div>}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-forest-700"><span className="inline-flex items-center gap-1.5"><details.Icon size={16} aria-hidden="true" />{details.label}</span>{insight.featured ? <span className="rounded-full bg-harvest-100 px-2 py-1 text-xs text-forest-950">Featured</span> : null}</div>
        <h2 className="mt-3 text-xl font-black leading-snug text-forest-950">{insight.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{insight.summary}</p>
        {insight.dataValue ? <p className="mt-4 text-2xl font-black tabular-nums text-forest-700">{insight.dataValue}</p> : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5"><div className="text-xs font-semibold text-slate-500">{insight.location ? <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden="true" />{insight.location}</span> : null}{insight.publishedAt ? <span className="block mt-1">Updated {new Date(insight.publishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span> : null}</div><Link href={`/market-intelligence/${insight.slug}`} className="inline-grid size-11 shrink-0 place-items-center rounded-md bg-forest-600 text-white transition group-hover:bg-forest-700" aria-label={`Read ${insight.title}`}><ArrowRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </article>
  );
}

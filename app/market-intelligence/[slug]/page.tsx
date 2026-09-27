"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MapPin, WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { insightTypeDetails } from "@/components/market-insight-card";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";

export default function MarketInsightDetailPage() {
  const params = useParams<{ slug: string }>();
  const insightQuery = useQuery({ queryKey: ["market-insight", params.slug], queryFn: () => api.marketInsightBySlug(params.slug), retry: 1 });
  const insight = insightQuery.data;

  if (insightQuery.isLoading) return <main><SiteHeader /><div className="mx-auto min-h-[70vh] max-w-4xl animate-pulse px-4 py-12"><div className="h-[520px] rounded-lg bg-forest-50" /></div></main>;
  if (insightQuery.isError || !insight) return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 text-center"><div><WifiOff className="mx-auto text-red-700" size={40} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Update unavailable</h1><p className="mt-3 text-slate-600">This entry may be unpublished, archived, or temporarily unavailable.</p><Link href="/market-intelligence" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">Back to intelligence</Link></div></section></main>;

  const details = insightTypeDetails[insight.type];
  return <main><SiteHeader /><article>
    <header className="border-b border-forest-100 bg-white"><div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><Link href="/market-intelligence" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-forest-700"><ArrowLeft size={17} aria-hidden="true" /> Market intelligence</Link><div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-black text-forest-700"><details.Icon size={18} aria-hidden="true" />{details.label}{insight.featured ? <span className="rounded-full bg-harvest-100 px-3 py-1 text-xs text-forest-950">Featured</span> : null}</div><h1 className="mt-4 text-4xl font-black leading-tight text-forest-950 sm:text-5xl">{insight.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{insight.summary}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">{insight.location ? <span className="inline-flex items-center gap-1"><MapPin size={16} aria-hidden="true" />{insight.location}</span> : null}{insight.publishedAt ? <span>Published {new Date(insight.publishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</span> : null}{insight.commodity ? <span>Commodity: {insight.commodity}</span> : null}</div></div></header>
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">{insight.imageUrl ? <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-forest-50"><Image src={insight.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" /></div> : null}{insight.dataValue ? <div className="mb-8 border-l-4 border-harvest-500 bg-harvest-100 p-5"><p className="text-sm font-black uppercase text-forest-700">Key update</p><p className="mt-1 text-3xl font-black tabular-nums text-forest-950">{insight.dataValue}</p></div> : null}<div className="space-y-5 text-lg leading-8 text-slate-700">{insight.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{insight.sourceName ? <div className="mt-10 border-t border-forest-100 pt-6"><p className="text-sm font-bold text-slate-500">Source supplied by the administrator</p>{insight.sourceUrl ? <a href={insight.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 font-black text-forest-700 underline">{insight.sourceName}<ExternalLink size={16} aria-hidden="true" /></a> : <p className="mt-2 font-black text-forest-950">{insight.sourceName}</p>}</div> : null}<div className="mt-10 rounded-lg bg-forest-950 p-6 text-white"><h2 className="text-xl font-black">Important context</h2><p className="mt-2 leading-7 text-white/75">This admin-managed update is provided for general market awareness. Confirm commercial terms, availability, and professional advice independently before making a business decision.</p></div></div>
  </article></main>;
}

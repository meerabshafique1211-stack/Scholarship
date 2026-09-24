import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InArticleAd } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { formatDate } from "@/lib/format";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article", url: `/guides/${g.slug}` },
  };
}

export default async function GuidePage({ params }: Props) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const half = Math.ceil(g.sections.length / 2);
  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, url: `${siteUrl()}/guides/${g.slug}` }} />
      <p className="text-sm text-ink-soft"><Link href="/guides" className="underline">Guides</Link></p>
      <h1 className="mt-1 font-serif text-4xl leading-tight text-ink">{g.title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Reviewed {formatDate(g.updated)}</p>
      {g.sections.map((s, i) => (
        <section key={s.heading} className="mt-8">
          <h2 className="font-serif text-2xl text-ink">{s.heading}</h2>
          {s.body.map((p) => <p key={p.slice(0, 40)} className="mt-3 leading-relaxed text-ink">{p}</p>)}
          {i === half - 1 && g.sections.length > 2 && <InArticleAd />}
        </section>
      ))}
      {g.sources?.length ? (
        <section className="mt-10 border-t border-paper-line pt-4">
          <h2 className="font-serif text-xl text-ink">Official sources</h2>
          <ul className="mt-2 space-y-1 text-sm">{g.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-route underline">{s.label}</a></li>)}</ul>
          <p className="mt-2 text-xs text-ink-soft">Rules and fees change. Always confirm on the official page before applying.</p>
        </section>
      ) : null}
      {g.related?.length ? (
        <nav aria-label="Related" className="mt-8 flex flex-wrap gap-2 text-sm">
          {g.related.map((r) => <Link key={r.href} href={r.href} className="rounded-full border border-paper-line px-3 py-1.5 text-ink hover:border-ink">{r.label}</Link>)}
        </nav>
      ) : null}
    </article>
  );
}

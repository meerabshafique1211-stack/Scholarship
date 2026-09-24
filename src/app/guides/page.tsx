import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides for international students",
  description: "Original guides on finding scholarships, applying abroad, CVs, motivation letters and studying in Italy, Spain, Denmark and Finland.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">Guides</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Practical guidance written for this site. Country facts link to the official source they come from.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug} className="rounded-md border border-paper-line p-5">
            <h2 className="font-serif text-xl text-ink"><Link href={`/guides/${g.slug}`} className="hover:text-route">{g.title}</Link></h2>
            <p className="mt-2 text-sm text-ink-soft">{g.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

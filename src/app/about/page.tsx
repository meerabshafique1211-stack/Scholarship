import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About", description: "How Global Scholarship Finder sources and verifies university and scholarship information.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-8 leading-relaxed text-ink">
      <h1 className="font-serif text-4xl">About this site</h1>
      <p>Global Scholarship Finder helps international students find real universities and verified scholarships, then prepare their applications.</p>
      <section><h2 className="font-serif text-2xl">Where the data comes from</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li><strong>Universities:</strong> the open <a className="text-route underline" href="https://github.com/Hipo/university-domains-list" target="_blank" rel="noopener noreferrer">Hipo university-domains list</a> (names, countries, domains, websites).</li>
          <li><strong>Research indicators:</strong> <a className="text-route underline" href="https://openalex.org" target="_blank" rel="noopener noreferrer">OpenAlex</a>, matched by website domain. These describe research output only, not teaching quality or jobs.</li>
          <li><strong>Scholarships:</strong> entered only from official university, government, Erasmus Mundus or scholarship-provider pages, and published only after verification. Each shows its source and the date it was checked.</li>
        </ul>
      </section>
      <section><h2 className="font-serif text-2xl">What we don&apos;t do</h2>
        <p className="mt-2">We don&apos;t publish sample or placeholder scholarships, guess deadlines from previous years, invent rankings or employment statistics, or promise that anyone will win a scholarship.</p>
      </section>
      <p><Link className="text-route underline" href="/contact">Report something outdated</Link></p>
    </article>
  );
}

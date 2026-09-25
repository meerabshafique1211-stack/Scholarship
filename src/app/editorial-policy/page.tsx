import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Editorial and verification policy", description: "How scholarships are verified, how often they are re-checked, and how corrections work.", alternates: { canonical: "/editorial-policy" } };

export default function EditorialPolicy() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-8 leading-relaxed text-ink">
      <h1 className="font-serif text-4xl">Editorial and verification policy</h1>
      <section><h2 className="font-serif text-2xl">What counts as a source</h2><p className="mt-2">We publish a scholarship only from an official page of the university, a government body, the Erasmus Mundus programme, or the scholarship provider itself. Blogs, aggregator sites, social media posts and AI chat answers can help us discover an opportunity, but they are never accepted as the source.</p></section>
      <section><h2 className="font-serif text-2xl">How a scholarship is verified</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Open the official page and confirm it belongs to the provider&apos;s own domain.</li>
          <li>Record only what the page states: funding components, eligible nationalities, degree levels, fields, dates and the official application link.</li>
          <li>Leave anything the page doesn&apos;t state as &ldquo;not stated&rdquo;. Deadlines for a new cycle are never copied from a previous year.</li>
          <li>Label funding strictly: &ldquo;Fully funded&rdquo; only when the source confirms tuition plus living support; tuition-only awards are &ldquo;100% tuition&rdquo;.</li>
          <li>Publish with the source link and the date of verification.</li>
        </ol>
      </section>
      <section><h2 className="font-serif text-2xl">Re-checking</h2><p className="mt-2">A daily job re-checks official pages. If a page changes or becomes unreachable, the scholarship is removed from public results until a person re-verifies it. Records not re-verified within 30 days are flagged for review. Scholarships are marked expired automatically when their official deadline passes.</p></section>
      <section><h2 className="font-serif text-2xl">Guides</h2><p className="mt-2">Guides are written for this site. Country facts link to the official page they come from, and each guide shows the date it was last reviewed.</p></section>
      <section><h2 className="font-serif text-2xl">AI use</h2><p className="mt-2">We don&apos;t use AI to write scholarship records. The optional motivation-letter and CV-feedback tools can use AI on the text you provide; their output is labelled as a draft to review.</p></section>
      <section><h2 className="font-serif text-2xl">Corrections</h2><p className="mt-2">If you find an error, <Link href="/contact" className="text-route underline">tell us</Link> with the official link. We re-check against the source and correct or remove the record.</p></section>
    </article>
  );
}

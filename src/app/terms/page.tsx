import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of use", description: "Terms for using Global Scholarship Finder.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-8 leading-relaxed text-ink">
      <h1 className="font-serif text-4xl">Terms of use</h1>
      <section><h2 className="font-serif text-2xl">Information, not decisions</h2><p className="mt-2">This site helps you find universities and scholarships and prepare applications. It does not decide admissions, award scholarships, or issue visas, and it does not guarantee any outcome.</p></section>
      <section><h2 className="font-serif text-2xl">Accuracy</h2><p className="mt-2">Scholarships are shown only after being checked against an official source, and each shows the date it was last checked. Official pages can change at any time. Always confirm eligibility, funding and deadlines on the official website before applying. If the official source and this site differ, the official source is correct.</p></section>
      <section><h2 className="font-serif text-2xl">Tools</h2><p className="mt-2">CV, transcript and motivation-letter results are guidance based on the text you provide. They are not official credential evaluations. You are responsible for the accuracy of anything you submit to a university or scholarship provider.</p></section>
      <section><h2 className="font-serif text-2xl">Third-party links and ads</h2><p className="mt-2">We link to official university, government and provider websites that we don&apos;t control. Advertisements, when shown, are labelled and are not endorsements or scholarship listings.</p></section>
      <section><h2 className="font-serif text-2xl">Acceptable use</h2><p className="mt-2">Don&apos;t misuse the site, attempt to bypass rate limits or access the admin area without authorisation, or upload files you have no right to share.</p></section>
    </article>
  );
}

import type { Metadata } from "next";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: "What data Global Scholarship Finder processes and which third-party services it uses.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  const email = contactEmail();
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-8 leading-relaxed text-ink">
      <h1 className="font-serif text-4xl">Privacy</h1>
      <p className="text-sm text-ink-soft">This page describes how the site currently works. It is not legal advice and makes no claim of compliance with any specific law.</p>
      <section><h2 className="font-serif text-2xl">No accounts</h2><p className="mt-2">Students don&apos;t need an account. We don&apos;t ask for your name, email or nationality to search.</p></section>
      <section><h2 className="font-serif text-2xl">Uploaded CVs and transcripts</h2><p className="mt-2">Files you upload to the CV, transcript or motivation-letter tools are read in server memory to produce your result and are then discarded. We don&apos;t save them to a database, disk or file storage, and there is no public link to them.</p>
        <p className="mt-2">If AI feedback or AI drafting is enabled and you use it, the text of your document and your form inputs are sent to Anthropic&apos;s API (anthropic.com) to generate the response. Anthropic processes that data under its own terms and policies.</p></section>
      <section><h2 className="font-serif text-2xl">Application tracker</h2><p className="mt-2">Tracker entries are stored only in your browser&apos;s local storage on your device. They are not sent to our servers. Clearing your browser data deletes them.</p></section>
      <section><h2 className="font-serif text-2xl">Hosting and logs</h2><p className="mt-2">The site is hosted on Vercel, which processes technical request data (such as IP address and user agent) to serve and secure the site. We use IP addresses briefly, in memory, to rate-limit requests.</p></section>
      <section><h2 className="font-serif text-2xl">Cookies</h2><p className="mt-2">The site sets a cookie only for administrators who sign in. If advertising is enabled, Google AdSense and its partners may use cookies or similar technologies to show and measure ads; see Google&apos;s explanation at <a className="text-route underline" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>. Where required, a consent message is shown before personalised ads.</p></section>
      <section><h2 className="font-serif text-2xl">University and research data</h2><p className="mt-2">University listings come from the open Hipo university-domains dataset, and research indicators from OpenAlex. Our servers request this public data; no personal data is sent to these services.</p></section>
      <section><h2 className="font-serif text-2xl">Contact</h2><p className="mt-2">{email ? <>Questions about privacy: <a className="text-route underline" href={`mailto:${email}`}>{email}</a>.</> : "A contact address will be published on the contact page."}</p></section>
    </article>
  );
}

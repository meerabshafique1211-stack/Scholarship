import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Disclaimer", description: "Limits of the scholarship and university information on Global Scholarship Finder.", alternates: { canonical: "/disclaimer" } };

export default function Disclaimer() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-8 leading-relaxed text-ink">
      <h1 className="font-serif text-4xl">Disclaimer</h1>
      <section><h2 className="font-serif text-2xl">Not affiliated</h2><p className="mt-2">Global Scholarship Finder is an independent information site. We are not affiliated with, endorsed by, or acting for any university, government, scholarship provider or Google. University names and trademarks belong to their owners.</p></section>
      <section><h2 className="font-serif text-2xl">Official sources decide</h2><p className="mt-2">Each scholarship shows the official page it was checked against and the date of that check. Providers can change eligibility, amounts and deadlines at any time. If anything here differs from the official source, the official source is correct. Always confirm on it before applying.</p></section>
      <section><h2 className="font-serif text-2xl">No guarantees</h2><p className="mt-2">Nothing on this site guarantees admission, a scholarship, a visa, a job or any other outcome. Tool results (CV, transcript, motivation letter) are guidance based on what you provide and are not official evaluations.</p></section>
      <section><h2 className="font-serif text-2xl">We never charge for scholarships</h2><p className="mt-2">We don&apos;t sell applications, charge &ldquo;processing fees&rdquo;, or ask for payment to be considered for a scholarship. Be cautious of anyone who does.</p></section>
      <section><h2 className="font-serif text-2xl">Advertising</h2><p className="mt-2">If ads are shown, they are provided by third parties, are labelled &ldquo;Advertisement&rdquo;, and are not scholarship listings or endorsements.</p></section>
      <p><Link href="/editorial-policy" className="text-route underline">How we verify information</Link> · <Link href="/contact" className="text-route underline">Report an error</Link></p>
    </article>
  );
}

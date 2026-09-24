import type { Metadata } from "next";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Contact Global Scholarship Finder, or report outdated scholarship information.", alternates: { canonical: "/contact" } };

export default function Contact() {
  const email = contactEmail();
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-8 leading-relaxed text-ink">
      <h1 className="font-serif text-4xl">Contact</h1>
      {email ? (
        <p>Email us at <a className="text-route underline" href={`mailto:${email}`}>{email}</a>.</p>
      ) : (
        <p className="text-ink-soft">Our contact address is being set up and will appear here.</p>
      )}
      <h2 className="pt-4 font-serif text-2xl">Report outdated or incorrect information</h2>
      <p>If a scholarship&apos;s official page no longer matches what we show, send us the scholarship name and the official link. We&apos;ll re-check it against the source and update or remove it.</p>
      <p className="text-sm text-ink-soft">We can&apos;t help with individual admission decisions or visa cases; please contact the university or authority directly.</p>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application tools",
  description: "Free tools to assess your CV and transcript, draft a motivation letter and track scholarship applications.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  { href: "/tools/cv", title: "Assess my CV", text: "See what your CV states clearly, what's missing, and which verified scholarships are potentially relevant." },
  { href: "/tools/transcript", title: "Check my transcript", text: "Read your GPA, credits and courses from your transcript and compare them with a published minimum." },
  { href: "/tools/motivation-letter", title: "Motivation letter assistant", text: "Build a draft from your own experience and goals. Nothing is invented; gaps are marked for you to fill." },
  { href: "/tools/tracker", title: "Application tracker", text: "Track deadlines, statuses and documents for every application. Stored only in your browser." },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">Application tools</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Uploaded files are read in memory to produce your result and are not stored. These tools give guidance, not admission decisions.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <li key={t.href} className="rounded-md border border-paper-line p-5">
            <h2 className="font-serif text-2xl text-ink"><Link href={t.href} className="hover:text-route">{t.title}</Link></h2>
            <p className="mt-2 text-sm text-ink-soft">{t.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

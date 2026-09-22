import Link from "next/link";

export function EmptyState({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="rounded-md border border-dashed border-ink/25 p-6">
      <p className="font-serif text-xl text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">We only show scholarships that have been checked against an official source. Nothing is filled in to make this page look fuller.</p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="inline-block rounded-full border border-paper-line px-3 py-1.5 text-ink hover:border-ink">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

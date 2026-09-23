import Link from "next/link";
import { formatCount, formatDate } from "@/lib/format";
import type { UniversityView } from "@/lib/types";

/** One real university. Links use only URLs returned by the source; nothing is generated from the name. */
export function UniversityCard({ u, scholarshipCount }: { u: UniversityView; scholarshipCount?: number }) {
  const place = [u.city, u.state, u.country].filter(Boolean).join(", ");
  return (
    <article className="grid gap-3 border-b border-paper-line py-4 md:grid-cols-[1fr_auto] md:items-start">
      <div className="min-w-0">
        <h3 className="font-serif text-lg leading-snug text-ink">
          <Link href={`/universities/${u.id}`} className="hover:text-route">{u.name}</Link>
        </h3>
        <p className="text-sm text-ink-soft">{place}. Domain: {u.officialDomain}</p>
        {typeof scholarshipCount === "number" && (
          <p className={`mt-1 text-sm ${scholarshipCount ? "font-medium text-seal" : "text-ink-soft"}`}>
            {scholarshipCount ? `${scholarshipCount} verified scholarship${scholarshipCount > 1 ? "s" : ""}` : "No verified scholarship found"}
          </p>
        )}
        {u.researchSource && u.worksCount !== null && (
          <p className="mt-1 text-xs text-ink-soft">Research output (OpenAlex): {formatCount(u.worksCount)} works, {formatCount(u.citedByCount ?? 0)} citations</p>
        )}
        <p className="mt-1 text-xs text-ink-faint">
          Source: Hipo university list, retrieved {formatDate(u.lastVerifiedAt)}{u.verificationStatus === "VERIFIED" ? ". Website checked by admin" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {u.officialWebsite && (
          <a href={u.officialWebsite} target="_blank" rel="noopener noreferrer" className="rounded-md border border-ink px-3 py-1.5 font-medium text-ink hover:bg-paper-tint">
            University website
          </a>
        )}
        <Link href={`/universities/${u.id}`} className="rounded-md bg-ink px-3 py-1.5 font-medium text-white hover:bg-ink-soft">View scholarships</Link>
      </div>
    </article>
  );
}

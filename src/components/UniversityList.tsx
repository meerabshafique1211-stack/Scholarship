import { formatCount, formatDate } from "@/lib/format";
import type { UniversityView } from "@/lib/types";

export function UniversityList({ items, scholarshipCounts }: { items: UniversityView[]; scholarshipCounts: Map<string, number> }) {
  return (
    <ul className="divide-y divide-paper-line border-y border-paper-line">
      {items.map((u) => {
        const n = scholarshipCounts.get(u.officialDomain) ?? 0;
        return (
          <li key={u.key} className="grid gap-2 py-4 md:grid-cols-[1fr_16rem]">
            <div className="min-w-0">
              <h3 className="font-serif text-lg leading-snug text-ink">{u.name}</h3>
              <p className="text-sm text-ink-soft">
                {[u.city, u.state, u.country].filter(Boolean).join(", ")}
                {u.officialWebsite && (
                  <>
                    {". "}
                    <a href={u.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-route underline underline-offset-2">
                      {u.officialDomain}
                    </a>
                  </>
                )}
              </p>
              <p className={`mt-1 text-sm ${n ? "font-medium text-seal" : "text-ink-soft"}`}>
                {n ? `${n} verified scholarship${n > 1 ? "s" : ""}` : "No verified scholarship found"}
              </p>
            </div>
            <div className="text-xs text-ink-soft md:text-right">
              {u.researchSource && u.worksCount !== null ? (
                <p>
                  Research output:{" "}
                  <a href={u.researchSourceUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {formatCount(u.worksCount)} works, {formatCount(u.citedByCount ?? 0)} citations (OpenAlex)
                  </a>
                </p>
              ) : (
                <p>Research data not available</p>
              )}
              <p>Career data not available</p>
              <p>
                Listed in{" "}
                <a href={u.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Hipo university list</a>, checked {formatDate(u.lastVerifiedAt)}
                {u.verificationStatus === "VERIFIED" ? ". Website verified by admin" : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

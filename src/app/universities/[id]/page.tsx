import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { filterScholarships } from "@/lib/filter";
import { FUNDING_LABEL, formatCount, formatDate } from "@/lib/format";
import { listPublicScholarships } from "@/lib/scholarships";
import { EMPTY_FILTERS } from "@/lib/types";
import { getUniversityById } from "@/lib/universities";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university } = await getUniversityById((await params).id);
  return { title: university ? university.name : "University" };
}

export default async function UniversityPage({ params }: Props) {
  const { id } = await params;
  const [{ university: u, error }, pub] = await Promise.all([getUniversityById(id), listPublicScholarships()]);
  if (error) {
    return (
      <div className="mx-auto max-w-page px-4 py-10">
        <p role="alert" className="text-caution">{error}</p>
      </div>
    );
  }
  if (!u) notFound();

  const mine = filterScholarships(pub.items.filter((s) => s.university && u.domains.includes(s.university.officialDomain)), EMPTY_FILTERS);
  const categories = Array.from(new Set(mine.map(({ s }) => FUNDING_LABEL[s.fundingType])));

  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <p className="text-sm text-ink-soft"><Link href={`/universities?country=${u.countryCode}`} className="underline">Universities in {u.country}</Link></p>
      <h1 className="mt-1 font-serif text-4xl leading-tight text-ink">{u.name}</h1>

      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs text-ink-soft">Country</dt><dd className="text-ink">{u.country}</dd></div>
        <div><dt className="text-xs text-ink-soft">Location</dt><dd className="text-ink">{[u.city, u.state].filter(Boolean).join(", ") || "Not provided by the source"}</dd></div>
        <div>
          <dt className="text-xs text-ink-soft">Official website</dt>
          <dd>{u.officialWebsite ? <a href={u.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-route underline">{u.officialWebsite}</a> : <span className="text-ink-soft">Not listed by the source</span>}</dd>
        </div>
        <div><dt className="text-xs text-ink-soft">Official domain{u.domains.length > 1 ? "s" : ""}</dt><dd className="text-ink">{u.domains.join(", ")}</dd></div>
        <div>
          <dt className="text-xs text-ink-soft">Source</dt>
          <dd className="text-ink">
            <a href={u.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Hipo university list</a>, retrieved {formatDate(u.lastVerifiedAt)}
          </dd>
        </div>
        {u.rorId && <div><dt className="text-xs text-ink-soft">ROR ID</dt><dd><a href={u.rorId} target="_blank" rel="noopener noreferrer" className="text-route underline">{u.rorId.replace("https://ror.org/", "")}</a></dd></div>}
      </dl>

      <section aria-labelledby="sch" className="mt-12">
        <h2 id="sch" className="font-serif text-2xl text-ink">Verified scholarships ({mine.length})</h2>
        {categories.length > 0 && <p className="mt-1 text-sm text-ink-soft">Funding categories: {categories.join(", ")}</p>}
        {mine.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-ink/25 p-5">
            <p className="font-medium text-ink">No verified scholarships found for this university.</p>
            <p className="mt-1 text-sm text-ink-soft">This means we have not verified one yet. It does not mean the university offers none. Check the university&apos;s official website for its current funding options.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">{mine.map(({ s, status }) => <li key={s.id}><ScholarshipCard s={s} status={status} citizenship={null} /></li>)}</ul>
        )}
      </section>

      <section aria-labelledby="research" className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="research" className="font-serif text-xl text-ink">Academic and research information</h2>
          {u.researchSource ? (
            <>
              <dl className="mt-3 space-y-2 text-sm">
                {u.institutionType && <div><dt className="inline text-ink-soft">Institution type: </dt><dd className="inline text-ink">{u.institutionType}</dd></div>}
                {u.worksCount !== null && <div><dt className="inline text-ink-soft">Research works indexed: </dt><dd className="inline text-ink">{formatCount(u.worksCount)}</dd></div>}
                {u.citedByCount !== null && <div><dt className="inline text-ink-soft">Citations: </dt><dd className="inline text-ink">{formatCount(u.citedByCount)}</dd></div>}
              </dl>
              <p className="mt-2 text-xs text-ink-soft">
                Source: <a href={u.researchSourceUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="underline">OpenAlex</a>, matched by website domain. These measure research output, not teaching quality or graduate employment.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Research data not available for this institution.</p>
          )}
        </div>
        <div>
          <h2 className="font-serif text-xl text-ink">Careers and employment</h2>
          <p className="mt-3 text-sm text-ink-soft">Career data not available. We don&apos;t show employment rates, salaries or rankings unless they come from a documented, current source.</p>
        </div>
      </section>
    </div>
  );
}

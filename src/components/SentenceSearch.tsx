"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "@/lib/reference";

const inline = "mx-1 inline-block max-w-full rounded-md border-b-2 border-route bg-route-tint px-2 py-0.5 font-serif text-route focus-visible:outline focus-visible:outline-2 focus-visible:outline-route";

export function SentenceSearch() {
  const router = useRouter();
  const [citizenship, setCitizenship] = useState("PK");
  const [degree, setDegree] = useState("MASTER");
  const [field, setField] = useState("");
  const [country, setCountry] = useState("IT");
  const [funding, setFunding] = useState("all");
  const [q, setQ] = useState("");

  const go = () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (citizenship) p.set("citizenship", citizenship);
    if (degree) p.set("degree", degree);
    if (field) p.set("field", field);
    if (country) p.set("country", country);
    if (funding !== "all") p.set("funding", funding);
    router.push(`/search?${p.toString()}`);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); go(); }} className="mt-8">
      <p className="text-2xl leading-[2.4] text-ink sm:text-3xl sm:leading-[2.2]">
        I&apos;m from
        <select aria-label="Citizenship" className={inline} value={citizenship} onChange={(e) => setCitizenship(e.target.value)}>
          {CITIZENSHIPS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        and want a
        <select aria-label="Degree" className={inline} value={degree} onChange={(e) => setDegree(e.target.value)}>
          <option value="BACHELOR">Bachelor&apos;s</option>
          <option value="MASTER">Master&apos;s</option>
          <option value="PHD">PhD</option>
        </select>
        in
        <select aria-label="Field" className={inline} value={field} onChange={(e) => setField(e.target.value)}>
          <option value="">any field</option>
          {FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.label}</option>)}
        </select>
        in
        <select aria-label="Country" className={inline} value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">any country</option>
          {DESTINATIONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        with
        <select aria-label="Funding" className={inline} value={funding} onChange={(e) => setFunding(e.target.value)}>
          <option value="all">any funding</option>
          <option value="fully_funded">full funding</option>
          <option value="full_tuition">100% tuition</option>
          <option value="50">a 50% scholarship</option>
          <option value="none">no scholarship needed</option>
        </select>
        .
      </p>
      <div className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
        <label htmlFor="home-q" className="sr-only">What do you want to study?</label>
        <input id="home-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={200}
          placeholder="Or type: Computer Science scholarships in Italy"
          className="w-full rounded-md border border-ink/30 bg-paper px-4 py-3 text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-route" />
        <button className="shrink-0 rounded-md bg-ink px-6 py-3 font-medium text-white hover:bg-ink-soft">Find opportunities</button>
      </div>
    </form>
  );
}

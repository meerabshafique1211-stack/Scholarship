import { NextResponse } from "next/server";
import { askClaude, aiEnabled } from "@/lib/ai";
import { analyzeCv } from "@/lib/cv-analysis";
import { parseUpload } from "@/lib/documents";
import { eligibleFor, filterScholarships } from "@/lib/filter";
import { countryByCode } from "@/lib/reference";
import { listPublicScholarships } from "@/lib/scholarships";
import { fileOf, noStore, str, toolGuard } from "@/lib/tool-helpers";
import { EMPTY_FILTERS, type DegreeLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = toolGuard(req, "cv");
  if (blocked) return blocked;
  const form = await req.formData();
  const doc = await parseUpload(fileOf(form.get("file")));
  if (!doc.ok) return NextResponse.json({ error: doc.error }, { status: 422, headers: noStore });

  const findings = analyzeCv(doc.text);
  const country = countryByCode(str(form.get("country")))?.code ?? null;
  const degreeRaw = str(form.get("degree")).toUpperCase();
  const degree = (["BACHELOR", "MASTER", "PHD"].includes(degreeRaw) ? degreeRaw : null) as DegreeLevel | null;
  const field = str(form.get("field"), 60) || null;
  const nationality = str(form.get("nationality"), 2).toUpperCase() || null;

  // Relevance uses only published, verified eligibility fields. It never predicts outcomes.
  const pub = await listPublicScholarships();
  const relevant = filterScholarships(pub.items, { ...EMPTY_FILTERS, countries: country ? [country] : [], degree, field, citizenship: nationality })
    .slice(0, 10)
    .map(({ s, status }) => ({
      id: s.id, name: s.name, provider: s.providerName, status, officialScholarshipUrl: s.officialScholarshipUrl,
      indicators: [
        nationality ? (eligibleFor(s, nationality) ? "Nationality appears to meet the published criteria" : "Nationality not eligible") : "Nationality not provided",
        degree ? (s.degreeLevels.includes(degree) ? "Degree level matches the published criteria" : "Degree level differs") : "Target degree not provided",
        "Academic and other requirements: requires verification on the official page",
      ],
    }));

  let ai: string | null = null;
  let aiError: string | null = null;
  if (aiEnabled() && form.get("useAi") === "on") {
    const r = await askClaude(
      "Review this CV for a scholarship application. Reply in plain text with four short headed sections: Profile summary, Strengths, Missing information, Suggested improvements. Quote or paraphrase only what the CV says.",
      `Target: degree=${degree ?? "not given"}, field=${field ?? "not given"}, country=${country ?? "not given"}\n\nCV TEXT:\n${doc.text.slice(0, 20_000)}`,
    );
    if (r.ok) ai = r.text; else aiError = r.error;
  }
  return NextResponse.json({ findings, relevant, verifiedTotal: pub.items.length, ai, aiError, aiAvailable: aiEnabled() }, { headers: noStore });
}

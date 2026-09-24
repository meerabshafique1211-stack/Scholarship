import { NextResponse } from "next/server";
import { parseUpload } from "@/lib/documents";
import { fileOf, noStore, str, toolGuard } from "@/lib/tool-helpers";
import { analyzeTranscript, compareGpa } from "@/lib/transcript-analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = toolGuard(req, "transcript");
  if (blocked) return blocked;
  const form = await req.formData();
  const doc = await parseUpload(fileOf(form.get("file")));
  if (!doc.ok) return NextResponse.json({ error: doc.error }, { status: 422, headers: noStore });

  const findings = analyzeTranscript(doc.text);
  const num = (k: string) => {
    const v = Number(str(form.get(k), 10));
    return Number.isFinite(v) && v > 0 && v <= 100 ? v : null;
  };
  const sourceUrl = str(form.get("sourceUrl"), 500);
  const comparison = compareGpa(findings.gpa, num("minGpa"), num("minScale"));
  return NextResponse.json(
    { findings, comparison, requirementSource: /^https:\/\//.test(sourceUrl) ? sourceUrl : null },
    { headers: noStore },
  );
}

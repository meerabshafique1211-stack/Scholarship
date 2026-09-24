import { NextResponse } from "next/server";
import { askClaude, aiEnabled } from "@/lib/ai";
import { parseUpload } from "@/lib/documents";
import { fileOf, noStore, str, toolGuard } from "@/lib/tool-helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = toolGuard(req, "letter");
  if (blocked) return blocked;
  const form = await req.formData();
  const f = {
    university: str(form.get("university"), 200),
    program: str(form.get("program"), 200),
    scholarship: str(form.get("scholarship"), 200),
    degree: str(form.get("degree"), 40),
    field: str(form.get("field"), 100),
    experience: str(form.get("experience"), 3000),
    goals: str(form.get("goals"), 2000),
    whyProgram: str(form.get("whyProgram"), 2000),
  };
  if (!f.university || !f.program) return NextResponse.json({ error: "Enter the university and the programme." }, { status: 400, headers: noStore });

  let cvText = "";
  let transcriptText = "";
  const cv = fileOf(form.get("cv"));
  if (cv) {
    const d = await parseUpload(cv);
    if (!d.ok) return NextResponse.json({ error: `CV: ${d.error}` }, { status: 422, headers: noStore });
    cvText = d.text;
  }
  const tr = fileOf(form.get("transcript"));
  if (tr) {
    const d = await parseUpload(tr);
    if (!d.ok) return NextResponse.json({ error: `Transcript: ${d.error}` }, { status: 422, headers: noStore });
    transcriptText = d.text;
  }

  if (!aiEnabled()) {
    // Without AI we return a structured outline built only from the student's own inputs.
    const outline = [
      `Dear Admissions Committee of ${f.university},`,
      "",
      `[Opening: why you are applying to ${f.program}${f.scholarship ? ` and the ${f.scholarship}` : ""}, in one or two sentences.]`,
      "",
      `Academic background: [your degree, institution and relevant courses exactly as on your transcript]${f.field ? ` in ${f.field}` : ""}.`,
      "",
      f.experience ? `Experience: ${f.experience}` : "[Experience: your relevant roles, projects or responsibilities, with real results.]",
      "",
      f.whyProgram ? `Why this programme: ${f.whyProgram}` : `[Why ${f.program}: specific courses, faculty or features from the official programme page.]`,
      "",
      f.goals ? `Career goals: ${f.goals}` : "[Career goals: short-term and long-term, and how the programme connects them.]",
      "",
      "[Closing: thank the committee and restate your motivation.]",
    ].join("\n");
    return NextResponse.json({ draft: outline, mode: "outline" }, { headers: noStore });
  }

  const r = await askClaude(
    "Write a motivation letter DRAFT (500–700 words) for the programme and scholarship described. Structure: introduction; academic background; experience; why this programme; why this university; career goals; closing. Use only the facts provided. Where a fact is needed but missing, insert a bracketed placeholder like [ADD: specific course you took]. Do not name faculty, courses or features of the university unless they appear in the inputs. Plain text only.",
    [
      `University: ${f.university}`, `Programme: ${f.program}`, `Scholarship: ${f.scholarship || "none specified"}`,
      `Degree level: ${f.degree || "not given"}`, `Field: ${f.field || "not given"}`,
      `Student's experience (their words): ${f.experience || "not given"}`,
      `Why this programme (their words): ${f.whyProgram || "not given"}`,
      `Career goals (their words): ${f.goals || "not given"}`,
      cvText ? `CV TEXT:\n${cvText.slice(0, 15_000)}` : "No CV provided.",
      transcriptText ? `TRANSCRIPT TEXT:\n${transcriptText.slice(0, 8_000)}` : "No transcript provided.",
    ].join("\n\n"),
    2200,
  );
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 503, headers: noStore });
  return NextResponse.json({ draft: r.text, mode: "ai" }, { headers: noStore });
}

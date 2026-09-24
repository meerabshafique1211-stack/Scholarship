import { findGpa } from "./cv-analysis";

// Rule-based transcript extraction. Never infers or converts grades.

export interface TranscriptFindings {
  gpa: { value: string; scale: string | null; raw: string } | null;
  credits: { value: string; unit: string; raw: string } | null;
  degree: string | null;
  major: string | null;
  graduation: string | null;
  courses: { code: string; title: string; credits: string | null; grade: string }[];
  notes: string[];
}

const GRADE = "(A\\+|A-|A|B\\+|B-|B|C\\+|C-|C|D\\+|D|E|F|P|S|\\d{2,3}|\\d\\.\\d{1,2})";

export function analyzeTranscript(text: string): TranscriptFindings {
  const gpa = findGpa(text);
  const c = /\b(total\s+)?(credit hours|credits earned|credits|ECTS|CFU)\s*[:\-–]?\s*(\d{2,3}(?:\.\d)?)/i.exec(text);
  const credits = c ? { value: c[3], unit: c[2], raw: c[0].trim() } : null;
  const d = /\b(Bachelor|Master|Doctor)(?:'s)? of [A-Z][A-Za-z &]+(?: in [A-Z][A-Za-z &]+)?|\b(BS|BSc|B\.Sc|BE|BBA|MS|MSc|M\.Sc|MBA|MPhil|PhD)\b[ \t]*(?:\(|in )?[A-Z][A-Za-z &]{2,40}/.exec(text);
  const degree = d ? d[0].trim().replace(/\s+/g, " ") : null;
  const m = /\b(major|programme|program|discipline|specialization)\s*[:\-–]\s*([A-Za-z &]{3,60})/i.exec(text);
  const major = m ? m[2].trim() : null;
  const g = /\b(date of (graduation|completion|award)|graduation date|degree awarded( on)?|conferred( on)?)\s*[:\-–]?\s*([A-Za-z0-9 ,./-]{6,25})/i.exec(text);
  const graduation = g ? g[5].trim() : null;

  const courses: TranscriptFindings["courses"] = [];
  const rowRe = new RegExp(`^\\s*([A-Z]{2,5}[- ]?\\d{3,4}[A-Z]?)\\s+(.{3,70}?)\\s+(\\d(?:\\.\\d)?)?\\s*${GRADE}\\s*$`, "gm");
  for (const r of text.matchAll(rowRe)) {
    courses.push({ code: r[1], title: r[2].trim(), credits: r[3] ?? null, grade: r[4] });
    if (courses.length >= 120) break;
  }

  const notes: string[] = [];
  if (!gpa) notes.push("No GPA/CGPA with a label was found. It may be in a table or image that can't be read as text.");
  if (gpa && !gpa.scale) notes.push("A GPA was found but no grading scale. Check the scale on the official transcript before comparing.");
  if (courses.length === 0) notes.push("Individual course rows could not be read reliably. Course tables in PDFs often lose their structure; check them manually.");
  return { gpa, credits, degree, major, graduation, courses, notes };
}

/** Compares only like with like. Different scales are never converted here. */
export function compareGpa(found: TranscriptFindings["gpa"], minValue: number | null, minScale: number | null): { status: "meets" | "below" | "needs_verification" | "not_compared"; message: string } {
  if (minValue === null) return { status: "not_compared", message: "No published minimum was entered, so nothing was compared." };
  if (!found) return { status: "needs_verification", message: "No GPA/CGPA was found in the transcript text, so we could not compare." };
  if (!found.scale || minScale === null) return { status: "needs_verification", message: "The grading scale is missing on one side. Confirm the scale with the university before comparing." };
  if (Number(found.scale) !== minScale) {
    return { status: "needs_verification", message: `Your grade is on a ${found.scale} scale and the requirement is on a ${minScale} scale. Conversion needs the university's official equivalency method; we don't convert grades.` };
  }
  return Number(found.value) >= minValue
    ? { status: "meets", message: `Your stated GPA (${found.value}/${found.scale}) appears to meet the published minimum (${minValue}/${minScale}). Requires verification by the university.` }
    : { status: "below", message: `Your stated GPA (${found.value}/${found.scale}) appears to be below the published minimum (${minValue}/${minScale}). Check whether other routes or exceptions exist on the official page.` };
}

// Rule-based CV analysis. Reports ONLY what is literally found in the text.

export interface CvFindings {
  wordCount: number;
  sections: Record<string, boolean>;
  degrees: string[];
  institutions: string[];
  gpa: { value: string; scale: string | null; raw: string } | null;
  languageTests: { test: string; score: string }[];
  datedEntries: number;
  hasEmail: boolean;
  hasPhone: boolean;
  quantifiedLines: number;
  strengths: string[];
  missing: string[];
  suggestions: string[];
}

const SECTION_PATTERNS: Record<string, RegExp> = {
  Education: /^\s*(education|academic (background|qualifications?)|qualifications)\b/im,
  "Work experience": /^\s*(work experience|professional experience|experience|employment( history)?|work history)\b/im,
  Skills: /^\s*(skills|technical skills|core competencies|key skills)\b/im,
  Certifications: /^\s*(certifications?|certificates|licen[cs]es)\b/im,
  Projects: /^\s*(projects|selected projects|academic projects)\b/im,
  Research: /^\s*(research( experience| interests)?)\b/im,
  Publications: /^\s*(publications|papers)\b/im,
  Languages: /^\s*(languages?|language skills)\b/im,
  "Awards / honours": /^\s*(awards|honou?rs|achievements|scholarships)\b/im,
};

const DEGREE_RE = /\b(Ph\.?\s?D|Doctor(?:ate)? of [A-Z][A-Za-z ]+|M\.?\s?Sc|M\.?\s?S\b|M\.?\s?Phil|MBA|M\.?\s?A\b|Master(?:'s)? of [A-Z][A-Za-z ]+|Master(?:'s)? in [A-Z][A-Za-z ]+|B\.?\s?Sc|B\.?\s?S\b|B\.?\s?E\b|B\.?\s?Tech|BBA|B\.?\s?A\b|Bachelor(?:'s)? of [A-Z][A-Za-z ]+|Bachelor(?:'s)? in [A-Z][A-Za-z ]+)/g;

export function findGpa(text: string): CvFindings["gpa"] {
  const withScale = /\b(C?GPA|CPI|grade point average)\s*[:\-–]?\s*(\d(?:\.\d{1,2})?)\s*(?:\/|out of)\s*(\d(?:\.\d{1,2})?)/i.exec(text);
  if (withScale) return { value: withScale[2], scale: withScale[3], raw: withScale[0].trim() };
  const noScale = /\b(C?GPA|CPI)\s*[:\-–]?\s*(\d\.\d{1,2})\b/i.exec(text);
  return noScale ? { value: noScale[2], scale: null, raw: noScale[0].trim() } : null;
}

export function analyzeCv(text: string): CvFindings {
  const sections = Object.fromEntries(Object.entries(SECTION_PATTERNS).map(([k, re]) => [k, re.test(text)]));
  const degrees = Array.from(new Set((text.match(DEGREE_RE) ?? []).map((d) => d.trim().replace(/\s+/g, " ")))).slice(0, 6);
  const institutions = Array.from(new Set(
    text.split("\n").map((l) => l.trim()).filter((l) => l.length < 120 && /\b(University|Universit[àaéy]|Institute|College|Polytechnic|School of)\b/.test(l)),
  )).slice(0, 5);
  const gpa = findGpa(text);
  const languageTests: CvFindings["languageTests"] = [];
  for (const [test, re] of [["IELTS", /IELTS[^0-9]{0,25}(\d(?:\.\d)?)/i], ["TOEFL", /TOEFL[^0-9]{0,25}(\d{2,3})/i], ["PTE", /\bPTE[^0-9]{0,25}(\d{2})/i], ["Duolingo", /Duolingo[^0-9]{0,25}(\d{2,3})/i]] as const) {
    const m = re.exec(text);
    if (m) languageTests.push({ test, score: m[1] });
  }
  const datedEntries = (text.match(/\b(19|20)\d{2}\s*[-–—to]+\s*((19|20)\d{2}|present|current|now)\b/gi) ?? []).length;
  const expBlock = /experience[\s\S]{0,4000}/i.exec(text)?.[0] ?? "";
  const quantifiedLines = expBlock.split("\n").filter((l) => /\d+\s?%|\b\d{2,}\b/.test(l)).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const strengths: string[] = [];
  const missing: string[] = [];
  const suggestions: string[] = [];
  if (degrees.length) strengths.push(`Degree(s) stated: ${degrees.join(", ")}.`);
  if (gpa) strengths.push(`Grade average stated: ${gpa.raw}.`);
  if (languageTests.length) strengths.push(`English test score stated: ${languageTests.map((t) => `${t.test} ${t.score}`).join(", ")}.`);
  if (sections["Research"] || sections["Publications"]) strengths.push("Has a research or publications section.");
  if (sections["Projects"]) strengths.push("Has a projects section.");
  if (datedEntries >= 2) strengths.push(`${datedEntries} dated entries (education or roles) found.`);

  for (const [k, present] of Object.entries(sections)) {
    if (!present && ["Education", "Work experience", "Skills", "Languages"].includes(k)) missing.push(`No clear "${k}" section heading found.`);
  }
  if (!gpa) missing.push("No GPA/CGPA with its scale found (e.g. \"CGPA 3.4/4.0\"). Many scholarships ask for it.");
  if (!languageTests.length) missing.push("No English test score found (IELTS, TOEFL, PTE or Duolingo), if you have one.");
  if (!/@/.test(text)) missing.push("No email address found.");
  if (datedEntries === 0) missing.push("No date ranges found. Add start and end dates (e.g. 2021–2024) to education and roles.");

  if (sections["Work experience"] && quantifiedLines < 2) suggestions.push("Add measurable results to your experience (numbers, percentages, scale) where they are true.");
  if (wordCount > 1100) suggestions.push(`Your CV is about ${wordCount} words. Scholarship CVs are usually easier to review at 1–2 pages.`);
  if (wordCount < 200) suggestions.push("Your CV is very short. Add details you actually have: coursework, projects, responsibilities.");
  if (!sections["Projects"] && !sections["Research"]) suggestions.push("If you have academic or personal projects, list them with your specific role.");
  suggestions.push("Use the same degree and grade wording as your official transcript.");

  return {
    wordCount, sections, degrees, institutions, gpa, languageTests, datedEntries,
    hasEmail: /[\w.+-]+@[\w-]+\.[\w.]+/.test(text), hasPhone: /\+?\d[\d\s()-]{8,}\d/.test(text),
    quantifiedLines, strengths, missing, suggestions,
  };
}

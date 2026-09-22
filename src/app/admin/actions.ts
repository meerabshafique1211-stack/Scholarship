"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminConfigured, createSession, passwordMatches, SESSION_COOKIE } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-session";
import { db, hasDb } from "@/lib/db";
import { countryByCode } from "@/lib/reference";
import { syncCountry } from "@/lib/universities";
import { scholarshipInput, structuralProblems, verificationProblems } from "@/lib/verification";

export type FormState = { errors: string[] } | null;

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  if (!adminConfigured()) return { errors: ["Admin is not configured. Set ADMIN_PASSWORD and AUTH_SECRET (32+ characters)."] };
  if (!(await passwordMatches(String(fd.get("password") ?? "")))) {
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return { errors: ["Incorrect password."] };
  }
  (await cookies()).set(SESSION_COOKIE, await createSession(), {
    httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 12 * 60 * 60,
  });
  redirect("/admin/scholarships");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

const toDate = (v: string | null) => (v ? new Date(`${v}T00:00:00Z`) : null);

export async function saveScholarship(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hasDb()) return { errors: ["Database is not configured (DATABASE_URL)."] };
  const intent = String(fd.get("intent") ?? "save");
  const id = String(fd.get("id") ?? "") || null;
  const note = String(fd.get("verificationNotes") ?? "").trim() || null;

  // Reject / expire only change status; they never need the record to be publishable.
  if (id && (intent === "reject" || intent === "expire")) {
    const status = intent === "reject" ? "REJECTED" : "EXPIRED";
    await db().scholarship.update({ where: { id }, data: { verificationStatus: status, verificationNotes: note } });
    await db().verificationLog.create({ data: { scholarshipId: id, action: intent === "reject" ? "rejected" : "expired", note, actor: "admin" } });
    revalidatePath("/");
    redirect(`/admin/scholarships/${id}?saved=${status}`);
  }

  const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
  raw.degreeLevels = fd.getAll("degreeLevels");
  const parsed = scholarshipInput.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.issues.map((i) => `${String(i.path[0] ?? "form")}: ${i.message}`) };
  const i = parsed.data;
  if (!countryByCode(i.countryCode)) return { errors: ["Choose a supported country."] };

  let universityId: string | null = null;
  let universityDomain: string | null = null;
  if (i.universityDomain) {
    const d = i.universityDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    const u = await db().university.findFirst({ where: { OR: [{ officialDomain: d }, { domains: { has: d } }], verificationStatus: { not: "REJECTED" } } });
    if (!u) return { errors: [`No university with domain “${d}” in the database. Sync its country first under Admin → Universities.`] };
    universityId = u.id;
    universityDomain = u.officialDomain;
  }

  let status: "VERIFIED" | "NEEDS_VERIFICATION";
  if (intent === "verify") {
    const problems = verificationProblems(i, universityDomain);
    const today = new Date().toISOString().slice(0, 10);
    if (i.deadline && i.deadline < today) problems.push("The official deadline has passed. Mark as expired, or enter the new cycle's official dates.");
    if (problems.length) return { errors: problems };
    status = "VERIFIED";
  } else {
    const problems = structuralProblems(i);
    if (problems.length) return { errors: problems };
    status = "NEEDS_VERIFICATION"; // any unverified edit takes the record out of public results
  }

  const data = {
    name: i.name, universityId, providerName: i.providerName, providerDomain: i.providerDomain, countryCode: i.countryCode,
    degreeLevels: i.degreeLevels, studyFields: i.studyFields, nationalityRule: i.nationalityRule, nationalities: i.nationalities,
    eligibilityText: i.eligibilityText, fundingType: i.fundingType,
    fundingPercentage: i.fundingType === "FULL_TUITION" || i.fundingType === "FULLY_FUNDED" ? 100 : i.fundingPercentage,
    fundingAmountText: i.fundingAmountText, tuitionCoverage: i.tuitionCoverage, livingStipend: i.livingStipend,
    accommodation: i.accommodation, healthInsurance: i.healthInsurance, travelSupport: i.travelSupport,
    applicationFee: i.applicationFee, cycle: i.cycle, intake: i.intake,
    openingDate: toDate(i.openingDate), deadline: toDate(i.deadline), statusUndetermined: i.statusUndetermined,
    previousCycleLabel: i.previousCycleLabel, previousCycleDeadline: toDate(i.previousCycleDeadline),
    officialScholarshipUrl: i.officialScholarshipUrl, officialApplicationUrl: i.officialApplicationUrl,
    sourceUrl: i.sourceUrl, sourceType: i.sourceType, verificationStatus: status, verificationNotes: i.verificationNotes,
    isDemo: false,
    ...(status === "VERIFIED" ? { lastVerifiedAt: new Date() } : {}),
  };

  const rec = id ? await db().scholarship.update({ where: { id }, data }) : await db().scholarship.create({ data });
  if (status === "VERIFIED") {
    await db().scholarshipSource.create({
      data: { scholarshipId: rec.id, sourceType: i.sourceType, sourceUrl: i.sourceUrl, providerName: i.providerName, lastChecked: new Date(), verificationStatus: "VERIFIED" },
    });
  }
  await db().verificationLog.create({
    data: { scholarshipId: rec.id, action: status === "VERIFIED" ? "verified" : id ? "updated" : "created", note: i.verificationNotes, actor: "admin" },
  });
  revalidatePath("/");
  redirect(`/admin/scholarships/${rec.id}?saved=${status}`);
}

export async function syncCountryAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const c = countryByCode(String(fd.get("country") ?? ""));
  if (!c) redirect("/admin/universities?error=Unknown%20country");
  let target: string;
  try {
    const r = await syncCountry(c.code);
    revalidatePath("/universities");
    target = `/admin/universities?synced=${c.code}&inserted=${r.inserted}&updated=${r.updated}`;
  } catch (e) {
    target = `/admin/universities?error=${encodeURIComponent((e as Error).message.slice(0, 200))}`;
  }
  redirect(target);
}

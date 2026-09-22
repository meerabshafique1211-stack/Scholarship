import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-session";
import { hasDb } from "@/lib/db";
import { DESTINATIONS } from "@/lib/reference";
import { AdminNav } from "../../AdminNav";
import { DbSetup } from "../../DbSetup";
import { ScholarshipForm } from "../../ScholarshipForm";

export const metadata: Metadata = { title: "Admin: add scholarship", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewScholarship() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <AdminNav />
      <h1 className="font-serif text-3xl text-ink">Add scholarship</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">Enter only what the official source states. Records stay private until you verify them.</p>
      <div className="mt-6">{hasDb() ? <ScholarshipForm d={{ nationalityRule: "ALL" }} countries={DESTINATIONS} /> : <DbSetup />}</div>
    </div>
  );
}

import type { Metadata } from "next";
import { CvTool } from "@/components/tools/CvTool";
import { aiEnabled } from "@/lib/ai";

export const metadata: Metadata = { title: "Assess my CV", description: "Check your CV for scholarship applications: strengths, missing information and suggested improvements.", alternates: { canonical: "/tools/cv" } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">Assess my CV</h1>
      <p className="mt-3 text-ink-soft">We read your CV&apos;s text and report only what it actually says. We never add experience, grades or skills, and we never predict whether you&apos;ll win a scholarship.</p>
      <div className="mt-8"><CvTool aiAvailable={aiEnabled()} /></div>
    </div>
  );
}

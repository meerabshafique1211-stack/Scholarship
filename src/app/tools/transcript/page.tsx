import type { Metadata } from "next";
import { TranscriptTool } from "@/components/tools/TranscriptTool";

export const metadata: Metadata = { title: "Check my transcript", description: "Read GPA, credits and courses from your transcript and compare them with a published requirement.", alternates: { canonical: "/tools/transcript" } };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">Check my transcript</h1>
      <p className="mt-3 text-ink-soft">We extract what can be read reliably and tell you when extraction fails. Grades are never guessed or converted between scales.</p>
      <div className="mt-8"><TranscriptTool /></div>
    </div>
  );
}

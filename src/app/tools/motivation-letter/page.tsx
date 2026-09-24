import type { Metadata } from "next";
import { LetterTool } from "@/components/tools/LetterTool";
import { aiEnabled } from "@/lib/ai";

export const metadata: Metadata = { title: "Motivation letter assistant", description: "Draft a scholarship motivation letter from your own experience and goals, without invented claims.", alternates: { canonical: "/tools/motivation-letter" } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">Motivation letter assistant</h1>
      <p className="mt-3 text-ink-soft">The result is a draft for you to review and rewrite in your own voice. It uses only what you provide; missing details are left as bracketed placeholders.</p>
      <div className="mt-8"><LetterTool aiAvailable={aiEnabled()} /></div>
    </div>
  );
}

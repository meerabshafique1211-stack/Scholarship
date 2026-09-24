import type { Metadata } from "next";
import { Tracker } from "@/components/tools/Tracker";

export const metadata: Metadata = { title: "Application tracker", description: "Track scholarship deadlines, statuses and documents.", alternates: { canonical: "/tools/tracker" }, robots: { index: false } };

export default function Page() {
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">My applications</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Saved only in this browser on this device. Nothing is sent to our servers. Use Export to back it up or move it to another device.</p>
      <div className="mt-8"><Tracker /></div>
    </div>
  );
}

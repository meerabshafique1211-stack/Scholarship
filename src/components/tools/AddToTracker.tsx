"use client";

import { useEffect, useState } from "react";
import { loadTracker, newApplication, saveTracker } from "@/lib/tracker";

export function AddToTracker(p: { scholarshipId: string; scholarship: string; university: string; deadline: string | null; applicationUrl: string | null }) {
  const [state, setState] = useState<"idle" | "added" | "exists" | "error">("idle");
  useEffect(() => {
    if (loadTracker().some((a) => a.scholarshipId === p.scholarshipId)) setState("exists");
  }, [p.scholarshipId]);
  const add = () => {
    const items = loadTracker();
    if (items.some((a) => a.scholarshipId === p.scholarshipId)) return setState("exists");
    const ok = saveTracker([...items, newApplication({ scholarshipId: p.scholarshipId, scholarship: p.scholarship, university: p.university, deadline: p.deadline?.slice(0, 10) ?? "", applicationUrl: p.applicationUrl ?? "" })]);
    setState(ok ? "added" : "error");
  };
  if (state === "exists" || state === "added")
    return <a href="/tools/tracker" className="rounded-md border border-seal px-3.5 py-2 text-sm font-medium text-seal">In your tracker</a>;
  return (
    <button type="button" onClick={add} className="rounded-md border border-paper-line px-3.5 py-2 text-sm font-medium text-ink hover:bg-paper-tint">
      {state === "error" ? "Browser storage unavailable" : "Add to my tracker"}
    </button>
  );
}

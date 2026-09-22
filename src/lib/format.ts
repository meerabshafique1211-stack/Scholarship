import type { Scholarship } from "./types";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/** "DD Month YYYY" as required by the brief. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Information not available";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

export function formatIntake(v: string): string {
  const [y, m] = v.split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : String(y);
}

export function formatMoney(amount: number | null, currency: string | null): string {
  if (amount === null || !currency) return "Not verified";
  if (amount === 0) return "No tuition fee";
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Headline funding line, e.g. "100% tuition + €900/month stipend". */
export function fundingHeadline(s: Scholarship): string {
  switch (s.fundingType) {
    case "fully_funded":
      return ["Fully funded", s.livingStipend ? `${s.livingStipend} stipend` : null].filter(Boolean).join(" + ");
    case "full_tuition":
      return "100% tuition";
    case "partial":
      return s.fundingPercentage !== null ? `${s.fundingPercentage}% tuition` : "Partial tuition (amount not verified)";
    case "other":
      return s.fundingAmountNote ?? "Other funding (amount not verified)";
  }
}

export function fundingLabel(t: Scholarship["fundingType"] | null): string {
  if (t === null) return "No scholarship verified";
  return { fully_funded: "Fully funded", full_tuition: "Full tuition", partial: "Partial", other: "Other funding" }[t];
}

export function fieldLabel(slug: string): string {
  return slug.split("-").map((w) => (w === "ai" ? "AI" : w[0].toUpperCase() + w.slice(1))).join(" ");
}

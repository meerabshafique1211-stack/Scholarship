import { createHash } from "node:crypto";

/**
 * Fingerprint of an official page's visible text. Used ONLY to detect change:
 * an unchanged page does not re-verify a scholarship, a changed or failing page
 * sends it back to human review.
 */
export async function fingerprintPage(url: string): Promise<{ ok: true; hash: string } | { ok: false; reason: string }> {
  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "GlobalScholarshipFinder-SourceMonitor/1.0 (+source change detection)" },
    });
  } catch (e) {
    return { ok: false, reason: `unreachable (${(e as Error).name})` };
  }
  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
  const html = (await res.text()).slice(0, 2_000_000);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (text.length < 50) return { ok: false, reason: "page has almost no readable text" };
  return { ok: true, hash: createHash("sha256").update(text).digest("hex") };
}

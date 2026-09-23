// Best-effort per-IP limiter for public API routes (per server instance).
// Protects the upstream providers from bursts; provider results are cached anyway.
const WINDOW_MS = 60_000;
const LIMIT = 60;
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  h.count++;
  return h.count > LIMIT ? { ok: false, retryAfter: Math.ceil((h.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}

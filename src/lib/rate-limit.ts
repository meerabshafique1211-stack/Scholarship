// Best-effort per-IP limiter (per server instance). Protects providers and paid APIs from bursts.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit = 60, windowMs = 60_000, scope = "default"): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const key = `${scope}:${ip}`;
  const h = buckets.get(key);
  if (!h || h.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  h.count++;
  return h.count > limit ? { ok: false, retryAfter: Math.ceil((h.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

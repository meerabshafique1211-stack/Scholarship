// Server-side JSON fetch with timeout, bounded retry/backoff and typed failures.
// Retries only on timeouts, network errors and 5xx. Never retries 4xx (incl. 429).

export type ProviderErrorKind = "timeout" | "network" | "rate_limited" | "auth" | "not_found" | "bad_request" | "server" | "parse";

export class ProviderError extends Error {
  constructor(public provider: string, public kind: ProviderErrorKind, public status: number | null, message: string) {
    super(`${provider}: ${message}`);
  }
}

function kindForStatus(s: number): ProviderErrorKind {
  if (s === 429) return "rate_limited";
  if (s === 401 || s === 403) return "auth";
  if (s === 404) return "not_found";
  if (s >= 400 && s < 500) return "bad_request";
  return "server";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchJson<T>(
  provider: string,
  url: string,
  { timeoutMs = 10_000, retries = 2, headers = {} }: { timeoutMs?: number; retries?: number; headers?: Record<string, string> } = {},
): Promise<T> {
  let last: ProviderError | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(400 * 3 ** (attempt - 1)); // 400ms, 1.2s
    let res: Response;
    try {
      res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(timeoutMs), headers: { accept: "application/json", ...headers } });
    } catch (e) {
      const name = (e as Error).name;
      last = new ProviderError(provider, name === "TimeoutError" || name === "AbortError" ? "timeout" : "network", null, (e as Error).message);
      continue;
    }
    if (!res.ok) {
      const kind = kindForStatus(res.status);
      last = new ProviderError(provider, kind, res.status, `HTTP ${res.status}`);
      if (kind === "server") continue;
      throw last; // 4xx, including 429: do not retry
    }
    try {
      return (await res.json()) as T;
    } catch {
      throw new ProviderError(provider, "parse", res.status, "invalid JSON");
    }
  }
  throw last ?? new ProviderError(provider, "network", null, "request failed");
}

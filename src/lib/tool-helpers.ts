import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "./rate-limit";

export function toolGuard(req: Request, scope: string): NextResponse | null {
  const rl = rateLimit(clientIp(req.headers), 8, 60_000, scope);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  const type = req.headers.get("content-type") ?? "";
  if (!type.startsWith("multipart/form-data")) return NextResponse.json({ error: "Expected a form upload." }, { status: 415 });
  return null;
}

export const noStore = { "Cache-Control": "no-store" };
export const str = (v: FormDataEntryValue | null, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const fileOf = (v: FormDataEntryValue | null) => (v instanceof File && v.size > 0 ? v : null);

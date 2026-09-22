// Edge- and Node-compatible admin session signing (Web Crypto HMAC-SHA256).
export const SESSION_COOKIE = "gsf_admin";
const TTL_MS = 12 * 60 * 60 * 1000;
const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.AUTH_SECRET?.length ?? 0) >= 32);
}

export async function createSession(): Promise<string> {
  const exp = String(Date.now() + TTL_MS);
  return `${exp}.${await sign(process.env.AUTH_SECRET!, exp)}`;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await sign(process.env.AUTH_SECRET!, exp));
}

export async function passwordMatches(input: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const secret = process.env.AUTH_SECRET!;
  return safeEqual(await sign(secret, input), await sign(secret, process.env.ADMIN_PASSWORD!));
}

import { ADSENSE_CLIENT } from "@/lib/adsense";

// ads.txt, generated from the configured publisher ID. 404 until AdSense is set up.
export function GET() {
  const m = /^ca-(pub-\d{10,20})$/.exec(ADSENSE_CLIENT);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${m[1]}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

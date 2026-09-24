// ads.txt, generated from the configured publisher ID. 404 until AdSense is set up.
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
  const m = /^ca-(pub-\d{10,20})$/.exec(client);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${m[1]}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

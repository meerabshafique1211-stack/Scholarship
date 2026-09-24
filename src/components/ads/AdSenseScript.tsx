import { ADSENSE_CLIENT, adsenseValid } from "@/lib/adsense";

/**
 * The exact snippet AdSense asks for, rendered server-side inside <head> on every page,
 * so Google's verifier sees it in the initial HTML.
 */
export function AdSenseScript() {
  if (!adsenseValid) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}

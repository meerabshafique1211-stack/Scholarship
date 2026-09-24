import Script from "next/script";

/** Loads the AdSense library only when a valid publisher ID is configured. */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
  if (!/^ca-pub-\d{10,20}$/.test(client)) return null;
  return (
    <Script
      id="adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}

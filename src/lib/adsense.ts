// AdSense publisher ID. This is a PUBLIC identifier (it appears in every page's HTML);
// it is not a secret. NEXT_PUBLIC_ADSENSE_CLIENT_ID overrides it if set.
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-6951949943263451";
export const adsenseValid = /^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT);

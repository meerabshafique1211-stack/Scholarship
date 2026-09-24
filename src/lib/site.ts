// Canonical site URL for metadata, sitemap and structured data. Never hardcode localhost.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000"; // local development only
}

export const SITE_NAME = "Global Scholarship Finder";
export const contactEmail = () => process.env.NEXT_PUBLIC_CONTACT_EMAIL || null;

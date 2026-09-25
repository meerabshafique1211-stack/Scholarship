import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME}: verified scholarships and real universities`, template: `%s | ${SITE_NAME}` },
  description: "Find real universities worldwide and scholarships verified against official sources, with application tools for international students.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en" },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

const NAV = [
  ["/search", "Search"],
  ["/universities", "Universities"],
  ["/scholarships", "Scholarships"],
  ["/scholarships/open-now", "Open now"],
  ["/tools", "Tools"],
  ["/guides", "Guides"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${newsreader.variable}`}>
      <head>
        <AdSenseScript />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
        <header className="border-b border-paper-line">
          <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="font-serif text-xl text-ink">{SITE_NAME}</Link>
            <nav aria-label="Main" className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
              {NAV.map(([href, label]) => <Link key={href} href={href} className="hover:text-ink">{label}</Link>)}
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="mt-16 border-t border-paper-line">
          <div className="mx-auto grid max-w-page gap-6 px-4 py-8 text-sm text-ink-soft md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <p>Scholarships appear only after they are checked against an official source. Always confirm details on that source before applying. We don&apos;t guarantee admission, funding, employment or visas.</p>
              <p>University data: <a className="underline" href="https://github.com/Hipo/university-domains-list" target="_blank" rel="noopener noreferrer">Hipo university-domains list</a>. Research data: <a className="underline" href="https://openalex.org" target="_blank" rel="noopener noreferrer">OpenAlex</a>.</p>
            </div>
            <nav aria-label="Site" className="flex flex-wrap gap-x-4 gap-y-1">
              {[["/about", "About"], ["/editorial-policy", "Editorial policy"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/disclaimer", "Disclaimer"]].map(([h, l]) => <Link key={h} href={h} className="hover:text-ink">{l}</Link>)}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

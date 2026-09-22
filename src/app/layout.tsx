import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { DemoBanner } from "@/components/Badges";
import { DATA_MODE } from "@/lib/repository";
import "./globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Global Scholarship Finder", template: "%s | Global Scholarship Finder" },
  description: "Find verified universities, scholarships and funding opportunities worldwide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
        {DATA_MODE === "demo" && <DemoBanner />}
        <header className="border-b border-paper-line">
          <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-serif text-xl text-ink">Global Scholarship Finder</Link>
            <nav aria-label="Main" className="flex gap-4 text-sm text-ink-soft">
              <Link href="/search" className="hover:text-ink">Search</Link>
              <Link href="/search?status=open" className="hover:text-ink">Open now</Link>
              <Link href="/search?funding=fully_funded" className="hidden hover:text-ink sm:inline">Fully funded</Link>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="mt-16 border-t border-paper-line">
          <div className="mx-auto max-w-page px-4 py-8 text-sm text-ink-soft">
            <p>Scholarship details change often. Always confirm on the official source before applying. This platform does not guarantee admission, funding, employment or visas.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

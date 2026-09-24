"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

import { ADSENSE_CLIENT as CLIENT, adsenseValid as adsEnabled } from "@/lib/adsense";

type Variant = "banner" | "responsive" | "in-article" | "sidebar";

const SLOTS: Record<Variant, string | undefined> = {
  banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER,
  responsive: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESPONSIVE,
  "in-article": process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

const HEIGHT: Record<Variant, string> = {
  banner: "min-h-[100px]",
  responsive: "min-h-[280px]",
  "in-article": "min-h-[250px]",
  sidebar: "min-h-[600px]",
};

/**
 * Renders NOTHING unless a real publisher ID and slot ID are configured.
 * Clearly labelled, visually separate from scholarship/university data, and
 * failure-safe: ad blockers or AdSense errors leave an empty, non-blocking box.
 */
export function AdSlot({ variant, className = "" }: { variant: Variant; className?: string }) {
  const slot = SLOTS[variant];
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocked or not ready: the page keeps working */
    }
  }, [slot]);

  if (!adsEnabled || !slot || !/^\d{6,20}$/.test(slot)) return null;
  return (
    <aside aria-label="Advertisement" className={`my-8 rounded-md bg-paper-tint p-2 ${className}`}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wide text-ink-faint">Advertisement</p>
      <div className={`${HEIGHT[variant]} overflow-hidden`}>
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          {...(variant === "in-article"
            ? { "data-ad-layout": "in-article", "data-ad-format": "fluid" }
            : { "data-ad-format": variant === "sidebar" ? "vertical" : "auto", "data-full-width-responsive": "true" })}
        />
      </div>
    </aside>
  );
}

export const AdBanner = (p: { className?: string }) => <AdSlot variant="banner" {...p} />;
export const ResponsiveAd = (p: { className?: string }) => <AdSlot variant="responsive" {...p} />;
export const InArticleAd = (p: { className?: string }) => <AdSlot variant="in-article" {...p} />;
export const SidebarAd = (p: { className?: string }) => <AdSlot variant="sidebar" {...p} />;

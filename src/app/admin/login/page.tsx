import type { Metadata } from "next";
import { adminConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-3xl text-ink">Admin sign in</h1>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="mt-4 text-ink-soft">
          Admin access isn&apos;t configured yet. In Vercel → Project → Settings → Environment Variables, set <code>ADMIN_PASSWORD</code> and <code>AUTH_SECRET</code> (at least 32 random characters), then redeploy.
        </p>
      )}
    </div>
  );
}

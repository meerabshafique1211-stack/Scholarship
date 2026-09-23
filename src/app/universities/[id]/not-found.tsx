import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-page px-4 py-16">
      <h1 className="font-serif text-3xl text-ink">No verified university found at this address.</h1>
      <p className="mt-2 text-ink-soft">The university may not be in the source data, or the link is incorrect.</p>
      <Link href="/universities" className="mt-4 inline-block text-route underline">Search universities</Link>
    </div>
  );
}

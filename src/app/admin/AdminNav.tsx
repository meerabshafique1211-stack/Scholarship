import Link from "next/link";
import { logout } from "./actions";

export function AdminNav() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-paper-line pb-3 text-sm">
      <nav className="flex gap-4">
        <Link href="/admin/scholarships" className="font-medium text-ink">Scholarships</Link>
        <Link href="/admin/scholarships/new" className="text-ink">Add scholarship</Link>
        <Link href="/admin/universities" className="text-ink">Universities</Link>
        <Link href="/admin/sources" className="text-ink">Data sources</Link>
      </nav>
      <form action={logout}><button className="text-route underline">Sign out</button></form>
    </div>
  );
}

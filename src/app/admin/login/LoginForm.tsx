"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <form action={action} className="mt-6 space-y-3">
      <label className="block text-sm text-ink">
        Password
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-md border border-paper-line px-3 py-2" />
      </label>
      {state?.errors.map((e) => <p key={e} className="text-sm text-caution">{e}</p>)}
      <button disabled={pending} className="rounded-md bg-ink px-4 py-2 font-medium text-white disabled:opacity-60">Sign in</button>
    </form>
  );
}

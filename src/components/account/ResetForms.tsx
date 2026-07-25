"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  resetPassword,
  type ResetState,
} from "@/lib/reset-actions";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-display text-chalk placeholder:text-chalk/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/40";
const btnCls =
  "press w-full rounded-2xl bg-teal px-4 py-3.5 font-display font-semibold text-white transition hover:bg-teal-bright disabled:opacity-60";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    requestPasswordReset,
    undefined,
  );
  return (
    <form action={action} className="mt-8 space-y-3">
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className={inputCls}
      />
      {state?.error && (
        <p className="font-display text-sm text-pink">{state.error}</p>
      )}
      {state?.ok && (
        <p className="font-display text-sm text-teal-bright">{state.ok}</p>
      )}
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="pt-2 font-display text-sm text-chalk/50">
        <Link href="/login" className="font-semibold text-teal-bright hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    resetPassword,
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="mt-8">
        <p className="font-display text-sm text-teal-bright">{state.ok}</p>
        <Link
          href="/login"
          className={`${btnCls} mt-4 inline-block text-center`}
        >
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-3">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <input
        type="password"
        name="next"
        required
        autoComplete="new-password"
        placeholder="New password (min 8 characters)"
        className={inputCls}
      />
      <input
        type="password"
        name="confirm"
        required
        autoComplete="new-password"
        placeholder="Confirm new password"
        className={inputCls}
      />
      {state?.error && (
        <p className="font-display text-sm text-pink">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

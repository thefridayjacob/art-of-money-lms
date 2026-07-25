"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithPassword, type AuthState } from "@/lib/auth-actions";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInWithPassword,
    undefined,
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-teal-bright"
        >
          The Art of Money
        </Link>
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-chalk">
          Welcome back.
        </h1>
        <p className="prose-money mt-3 text-chalk/60">
          Sign in to pick up where you left off.
        </p>

        <div className="mt-8">
          <GoogleButton />
        </div>

        <div className="my-5 flex items-center gap-3 text-chalk/30">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-display text-xs">or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form action={formAction} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-display text-chalk placeholder:text-chalk/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/40"
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-display text-chalk placeholder:text-chalk/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/40"
          />
          {state?.error && (
            <p className="font-display text-sm text-pink">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="press w-full rounded-2xl bg-teal px-4 py-3.5 font-display font-semibold text-white transition hover:bg-teal-bright disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="mt-4 font-display text-sm">
          <Link
            href="/forgot-password"
            className="text-chalk/50 transition hover:text-chalk"
          >
            Forgot your password?
          </Link>
        </p>

        <p className="mt-6 font-display text-sm text-chalk/50">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-teal-bright hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

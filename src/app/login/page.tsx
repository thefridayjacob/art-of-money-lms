import Link from "next/link";
import { requestMagicLink } from "./actions";

export default function LoginPage() {
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
          Enter your email and we&apos;ll send you a one-tap sign-in link. No
          passwords, ever.
        </p>

        <form action={requestMagicLink} className="mt-8 space-y-3">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-display text-chalk placeholder:text-chalk/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/40"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-teal px-4 py-3.5 font-display font-semibold text-white transition hover:bg-teal-bright active:scale-[0.99]"
          >
            Send me the link →
          </button>
        </form>

        <p className="mt-6 font-display text-xs text-chalk/40">
          New here? Same button — we&apos;ll create your account automatically.
        </p>
      </div>
    </main>
  );
}

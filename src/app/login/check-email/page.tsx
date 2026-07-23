import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-16 text-center">
      <div className="w-full max-w-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15 text-3xl">
          📬
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-chalk">
          Check your inbox
        </h1>
        <p className="prose-money mt-3 text-chalk/60">
          We sent a sign-in link to your email. Tap it and you&apos;re in. The
          link works once and expires in 24 hours.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block font-display text-sm font-semibold text-teal-bright hover:underline"
        >
          ← Use a different email
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ResetForm } from "@/components/account/ResetForms";

export const metadata = { title: "Set new password · The Art of Money" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

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
          New password.
        </h1>

        {token && email ? (
          <>
            <p className="prose-money mt-3 text-chalk/60">
              Choose a new password for {email}.
            </p>
            <ResetForm email={email} token={token} />
          </>
        ) : (
          <div className="mt-3">
            <p className="prose-money text-chalk/60">
              This reset link is incomplete or expired.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-block font-display text-sm font-semibold text-teal-bright hover:underline"
            >
              Request a new link →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

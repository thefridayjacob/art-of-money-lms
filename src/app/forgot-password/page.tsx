import Link from "next/link";
import { ForgotForm } from "@/components/account/ResetForms";

export const metadata = { title: "Reset password · The Art of Money" };

export default function ForgotPasswordPage() {
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
          Reset password.
        </h1>
        <p className="prose-money mt-3 text-chalk/60">
          Enter your email and we&apos;ll send a link to set a new password.
        </p>
        <ForgotForm />
      </div>
    </main>
  );
}

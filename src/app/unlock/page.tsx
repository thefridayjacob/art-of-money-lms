import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import {
  CheckCircle,
  GraduationCap,
  Cards,
  Infinity as InfinityIcon,
} from "@phosphor-icons/react/dist/ssr";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { lessons, models } from "@/db/schema";
import { userHasAccess } from "@/lib/access";
import {
  COURSE_PRICE_KOBO,
  formatNaira,
  paystackConfigured,
} from "@/lib/paystack";
import { PayButton } from "@/components/paywall/PayButton";

export const metadata = { title: "Unlock the course · The Art of Money" };

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.isAdmin || (await userHasAccess(session.user.id)))
    redirect("/dashboard");

  const { error, canceled } = await searchParams;

  const [[{ lessonCount }], [{ modelCount }]] = await Promise.all([
    db.select({ lessonCount: sql<number>`count(*)::int` }).from(lessons),
    db.select({ modelCount: sql<number>`count(*)::int` }).from(models),
  ]);

  const priceLabel = paystackConfigured() ? formatNaira(COURSE_PRICE_KOBO) : "—";

  const includes = [
    {
      icon: <GraduationCap size={18} weight="duotone" />,
      text: `All ${lessonCount} lessons, from “what is money” to the whole game`,
    },
    {
      icon: <Cards size={18} weight="duotone" />,
      text: `The full ${modelCount}-model deck, homework, and one-minute recaps`,
    },
    {
      icon: <InfinityIcon size={18} weight="duotone" />,
      text: "Lifetime access, progress tracking, XP, streaks & badges",
    },
  ];

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-teal-bright"
        >
          The Art of Money
        </Link>

        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-chalk">
          One payment.
          <br />
          The whole course.
        </h1>
        <p className="prose-money mt-3 text-chalk/60">
          You’re signed in as{" "}
          <span className="font-semibold text-chalk">{session.user.email}</span>
          . Unlock lifetime access to keep going.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold text-chalk">
              {priceLabel}
            </span>
            <span className="font-display text-sm text-chalk/50">
              one-time · lifetime
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {includes.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal-bright">
                  {f.icon}
                </span>
                <span className="prose-money text-sm text-chalk/80">
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {paystackConfigured() ? (
            <PayButton priceLabel={priceLabel} />
          ) : (
            <p className="mt-6 rounded-2xl border border-amber/30 bg-amber/10 px-4 py-3 text-center font-display text-sm text-amber">
              Checkout isn’t switched on yet. Please check back shortly.
            </p>
          )}

          {error && (
            <p className="mt-4 flex items-center justify-center gap-1.5 font-display text-sm text-pink">
              We couldn’t confirm that payment. If you were charged, it’ll unlock
              automatically — or contact support.
            </p>
          )}
          {canceled && (
            <p className="mt-4 text-center font-display text-sm text-chalk/50">
              Payment canceled. You can try again anytime.
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 font-display text-xs text-chalk/40">
          <CheckCircle size={14} weight="fill" className="text-teal" />
          Secure checkout · you keep access forever
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-8 text-center"
        >
          <button
            type="submit"
            className="font-display text-xs text-chalk/40 underline-offset-2 transition hover:text-chalk/70 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { userStats } from "@/db/schema";

export async function AppHeader() {
  const session = await auth();

  let xp = 0;
  if (session?.user?.id) {
    const rows = await db
      .select({ xp: userStats.xp })
      .from(userStats)
      .where(eq(userStats.userId, session.user.id))
      .limit(1);
    xp = rows[0]?.xp ?? 0;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3.5">
        <Link
          href="/dashboard"
          className="font-display text-sm font-extrabold tracking-tight text-ink"
        >
          The Art of <span className="text-teal">Money</span>
        </Link>

        <nav className="flex items-center gap-3 font-display text-sm sm:gap-4">
          <Link
            href="/learn"
            className="hidden text-muted transition hover:text-ink sm:inline"
          >
            Course
          </Link>
          <Link
            href="/deck"
            className="hidden text-muted transition hover:text-ink sm:inline"
          >
            Deck
          </Link>
          <Link
            href="/badges"
            className="hidden text-muted transition hover:text-ink sm:inline"
          >
            Badges
          </Link>
          {session?.user && (
            <span className="rounded-full bg-teal/10 px-2.5 py-1 font-display text-xs font-bold text-teal">
              {xp.toLocaleString()} XP
            </span>
          )}
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="text-muted transition hover:text-ink"
            >
              Admin
            </Link>
          )}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-ink/30 hover:text-ink"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

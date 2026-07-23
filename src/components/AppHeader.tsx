import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3.5">
        <Link
          href="/learn"
          className="font-display text-sm font-extrabold tracking-tight text-ink"
        >
          The Art of <span className="text-teal">Money</span>
        </Link>

        <nav className="flex items-center gap-4 font-display text-sm">
          <Link
            href="/learn"
            className="text-muted transition hover:text-ink"
          >
            Course
          </Link>
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

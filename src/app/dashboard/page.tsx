import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { email, displayName, isAdmin } = session.user;

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-16 text-center">
      <span className="peel" style={{ backgroundColor: "var(--color-teal)" }}>
        Signed in ✓
      </span>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-chalk">
        Welcome{displayName ? `, ${displayName}` : ""}.
      </h1>
      <p className="prose-money mt-3 text-chalk/60">
        You&apos;re authenticated as <span className="text-teal-bright">{email}</span>
        {isAdmin ? " (admin)" : ""}. The real dashboard lands in Phase 5.
      </p>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <button
          type="submit"
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-display text-sm font-semibold text-chalk/80 transition hover:bg-white/10"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

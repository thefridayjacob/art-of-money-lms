import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { badges, userBadges } from "@/db/schema";

export const metadata = { title: "Badges · The Art of Money" };

const COLORS: Record<string, string> = {
  teal: "var(--color-teal)",
  pink: "var(--color-pink)",
  amber: "var(--color-amber)",
};

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [all, earned] = await Promise.all([
    db.select().from(badges).orderBy(asc(badges.sort)),
    db
      .select({ badgeId: userBadges.badgeId, earnedAt: userBadges.earnedAt })
      .from(userBadges)
      .where(eq(userBadges.userId, session.user.id)),
  ]);

  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));
  const earnedCount = earned.length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <span className="peel" style={{ backgroundColor: "var(--color-amber)", color: "var(--color-ink)" }}>
        {earnedCount} / {all.length} earned
      </span>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink">
        Badges
      </h1>
      <p className="prose-money mt-2 max-w-xl text-muted">
        Proof of the work. Each one marks a real milestone — not a participation
        trophy.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((b) => {
          const isEarned = earnedMap.has(b.id);
          const color = COLORS[b.color] ?? "var(--color-teal)";
          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 transition ${
                isEarned
                  ? "border-border bg-card"
                  : "border-dashed border-border bg-ink/[0.02]"
              }`}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                style={{
                  backgroundColor: isEarned ? color : "var(--color-border)",
                  filter: isEarned ? "none" : "grayscale(1)",
                  opacity: isEarned ? 1 : 0.6,
                }}
              >
                {isEarned ? b.emoji : "🔒"}
              </div>
              <h3
                className={`mt-3 font-display text-base font-bold ${
                  isEarned ? "text-ink" : "text-muted"
                }`}
              >
                {b.name}
              </h3>
              <p className="prose-money mt-1 text-sm text-muted">
                {b.description}
              </p>
              {isEarned && (
                <p className="mt-3 font-display text-xs font-semibold text-teal">
                  ✓ Earned
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

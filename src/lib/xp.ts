import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { userStats, xpEvents } from "@/db/schema";

/** XP awarded per action (one-time per item; callers guard idempotency). */
export const XP = {
  resource_opened: 5,
  model_mastered: 10,
  homework_done: 25,
  taught_someone: 40,
  lesson_complete: 50,
} as const;

export type XpKind = keyof typeof XP | "streak_bonus" | "badge_earned";

/** Level curve: level N needs 100·N·(N-1)/2 cumulative XP (0,100,300,600…). */
export function levelForXp(xp: number): number {
  let level = 1;
  while ((100 * (level + 1) * level) / 2 <= xp) level++;
  return level;
}

/** Local calendar day in Africa/Lagos (WAT) as YYYY-MM-DD. */
function lagosToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const dbb = new Date(b + "T00:00:00Z").getTime();
  return Math.round((dbb - da) / 86_400_000);
}

/**
 * Award XP for an action and roll the daily streak forward. Ensures a
 * user_stats row exists. Records an xp_events ledger entry. Returns the
 * updated stats snapshot (for optimistic UI / toasts).
 */
export async function awardXp(
  userId: string,
  kind: XpKind,
  amount: number,
  meta?: string,
) {
  // ensure a stats row exists
  await db
    .insert(userStats)
    .values({ userId })
    .onConflictDoNothing({ target: userStats.userId });

  const [current] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  const today = lagosToday();
  let currentStreak = current.currentStreak;
  let longestStreak = current.longestStreak;

  if (current.lastActiveDate !== today) {
    if (current.lastActiveDate && daysBetween(current.lastActiveDate, today) === 1) {
      currentStreak += 1; // consecutive day
    } else {
      currentStreak = 1; // first day or streak broken
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  const newXp = current.xp + amount;

  await db
    .update(userStats)
    .set({
      xp: newXp,
      currentStreak,
      longestStreak,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));

  await db.insert(xpEvents).values({ userId, kind, amount, meta });

  return {
    xp: newXp,
    level: levelForXp(newXp),
    currentStreak,
    longestStreak,
  };
}

/**
 * Award XP only the first time a given (kind, meta) happens for a user.
 * Prevents farming by toggling an item on/off. Returns true if XP was
 * granted this call, false if it had already been awarded before.
 */
export async function awardXpOnce(
  userId: string,
  kind: keyof typeof XP,
  meta: string,
) {
  const existing = await db
    .select({ id: xpEvents.id })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        eq(xpEvents.kind, kind),
        eq(xpEvents.meta, meta),
      ),
    )
    .limit(1);

  if (existing.length > 0) return false;
  await awardXp(userId, kind, XP[kind], meta);
  return true;
}

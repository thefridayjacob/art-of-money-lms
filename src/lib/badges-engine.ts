import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import {
  lessons,
  lessonProgress,
  modelMastery,
  teachLog,
  userStats,
  badges,
  userBadges,
} from "@/db/schema";

export type EarnedBadge = {
  key: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
};

/**
 * Evaluate every badge's criteria against the user's current progress and
 * award any newly-earned ones. Idempotent (unique index guards duplicates).
 * Returns the badges freshly earned on this call (for celebration UI).
 */
export async function checkAndAwardBadges(
  userId: string,
): Promise<EarnedBadge[]> {
  const [
    completed,
    allLessons,
    masteredRows,
    teachRows,
    statsRow,
    allBadges,
    earned,
  ] = await Promise.all([
    db
      .select({ number: lessons.number, partId: lessons.partId })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.status, "completed"),
        ),
      ),
    db.select({ number: lessons.number, partId: lessons.partId }).from(lessons),
    db
      .select({ id: modelMastery.id })
      .from(modelMastery)
      .where(eq(modelMastery.userId, userId)),
    db.select({ id: teachLog.id }).from(teachLog).where(eq(teachLog.userId, userId)),
    db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1),
    db.select().from(badges),
    db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId)),
  ]);

  const completedNumbers = new Set(completed.map((c) => c.number));
  const completedCount = completed.length;
  const masteredCount = masteredRows.length;
  const teachCount = teachRows.length;
  const longestStreak = statsRow[0]?.longestStreak ?? 0;
  const earnedIds = new Set(earned.map((e) => e.badgeId));

  // total lessons per part (by part number → set of lesson numbers)
  // Map partId → part index isn't needed; we compare completion per part.
  const lessonsByPart = new Map<string, number>();
  for (const l of allLessons) {
    lessonsByPart.set(l.partId, (lessonsByPart.get(l.partId) ?? 0) + 1);
  }
  const completedByPart = new Map<string, number>();
  for (const c of completed) {
    completedByPart.set(c.partId, (completedByPart.get(c.partId) ?? 0) + 1);
  }
  // Which part-numbers (1..4) are fully complete? We need part number → partId.
  // allLessons has partId only; join with parts numbers via a quick map.
  const partNumberComplete = new Set<number>();
  // Build partId → partNumber from a parts query (small).
  const partRows = await db.query.parts.findMany({
    columns: { id: true, number: true },
  });
  for (const p of partRows) {
    const total = lessonsByPart.get(p.id) ?? 0;
    const doneInPart = completedByPart.get(p.id) ?? 0;
    if (total > 0 && doneInPart === total) partNumberComplete.add(p.number);
  }

  const meets = (b: typeof allBadges[number]): boolean => {
    switch (b.criteria) {
      case "lesson_complete":
        return completedNumbers.has(b.threshold);
      case "part_complete":
        return partNumberComplete.has(b.threshold);
      case "lessons_count":
        return completedCount >= b.threshold;
      case "models_count":
        return masteredCount >= b.threshold;
      case "teach_count":
        return teachCount >= b.threshold;
      case "streak_days":
        return longestStreak >= b.threshold;
      default:
        return false;
    }
  };

  const toAward = allBadges.filter((b) => !earnedIds.has(b.id) && meets(b));
  if (toAward.length === 0) return [];

  await db
    .insert(userBadges)
    .values(toAward.map((b) => ({ userId, badgeId: b.id })))
    .onConflictDoNothing({
      target: [userBadges.userId, userBadges.badgeId],
    });

  return toAward.map((b) => ({
    key: b.key,
    name: b.name,
    description: b.description,
    emoji: b.emoji,
    color: b.color,
  }));
}

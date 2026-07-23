import { db } from "@/db";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  parts,
  lessons,
  models,
  resources,
  lessonProgress,
  modelMastery,
  teachLog,
  resourceOpens,
  userStats,
  badges,
  userBadges,
} from "@/db/schema";
import { levelForXp } from "@/lib/xp";

function cumulativeXpForLevel(level: number): number {
  return (100 * level * (level - 1)) / 2;
}

export async function getDashboardData(userId: string) {
  const [
    statsRow,
    completedLessons,
    totalLessons,
    masteredCount,
    totalModels,
    teachCount,
    openedCount,
    totalResources,
    partProgress,
    allBadges,
    earnedRows,
    nextLessonRow,
  ] = await Promise.all([
    db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.status, "completed"),
        ),
      ),
    db.select({ n: sql<number>`count(*)::int` }).from(lessons),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(modelMastery)
      .where(eq(modelMastery.userId, userId)),
    db.select({ n: sql<number>`count(*)::int` }).from(models),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(teachLog)
      .where(eq(teachLog.userId, userId)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(resourceOpens)
      .where(eq(resourceOpens.userId, userId)),
    db.select({ n: sql<number>`count(*)::int` }).from(resources),
    db
      .select({
        partNumber: parts.number,
        partTitle: parts.title,
        total: sql<number>`count(${lessons.id})::int`,
        done: sql<number>`(count(*) filter (where ${lessonProgress.status} = 'completed'))::int`,
      })
      .from(parts)
      .innerJoin(lessons, eq(lessons.partId, parts.id))
      .leftJoin(
        lessonProgress,
        and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.userId, userId),
        ),
      )
      .groupBy(parts.number, parts.title)
      .orderBy(asc(parts.number)),
    db.select().from(badges).orderBy(asc(badges.sort)),
    db
      .select({ badgeId: userBadges.badgeId, earnedAt: userBadges.earnedAt })
      .from(userBadges)
      .where(eq(userBadges.userId, userId)),
    // next lesson to continue: lowest-numbered lesson not yet completed
    db
      .select({ number: lessons.number, title: lessons.title })
      .from(lessons)
      .leftJoin(
        lessonProgress,
        and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.userId, userId),
        ),
      )
      .where(sql`${lessonProgress.status} is distinct from 'completed'`)
      .orderBy(asc(lessons.number))
      .limit(1),
  ]);

  const xp = statsRow[0]?.xp ?? 0;
  const level = levelForXp(xp);
  const levelStart = cumulativeXpForLevel(level);
  const levelEnd = cumulativeXpForLevel(level + 1);
  const levelProgress =
    levelEnd > levelStart ? (xp - levelStart) / (levelEnd - levelStart) : 0;

  const earnedIds = new Set(earnedRows.map((e) => e.badgeId));

  return {
    xp,
    level,
    levelProgress, // 0..1 toward next level
    xpIntoLevel: xp - levelStart,
    xpForLevel: levelEnd - levelStart,
    currentStreak: statsRow[0]?.currentStreak ?? 0,
    longestStreak: statsRow[0]?.longestStreak ?? 0,
    lessons: { done: completedLessons[0].n, total: totalLessons[0].n },
    models: { done: masteredCount[0].n, total: totalModels[0].n },
    taught: { done: teachCount[0].n, total: totalLessons[0].n },
    resources: { done: openedCount[0].n, total: totalResources[0].n },
    parts: partProgress,
    badges: allBadges.map((b) => ({
      key: b.key,
      name: b.name,
      description: b.description,
      emoji: b.emoji,
      color: b.color,
      earned: earnedIds.has(b.id),
    })),
    earnedCount: earnedIds.size,
    badgeTotal: allBadges.length,
    nextLesson: nextLessonRow[0] ?? null,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

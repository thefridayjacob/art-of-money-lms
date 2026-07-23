"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  lessonProgress,
  modelMastery,
  homeworkStatus,
  teachLog,
} from "@/db/schema";
import { awardXpOnce, XP } from "@/lib/xp";
import { checkAndAwardBadges } from "@/lib/badges-engine";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function revalidateLesson(lessonNumber: number) {
  revalidatePath(`/learn/${lessonNumber}`);
  revalidatePath("/learn");
  revalidatePath("/dashboard");
  revalidatePath("/deck");
  revalidatePath("/badges");
}

/** Mark a lesson as at least started (idempotent, no XP). */
async function ensureStarted(userId: string, lessonId: string) {
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, status: "in_progress", startedAt: new Date() })
    .onConflictDoNothing({
      target: [lessonProgress.userId, lessonProgress.lessonId],
    });
}

/** Toggle a model as mastered. Awards XP once (first mastery only). */
export async function toggleModelMastery(
  modelId: string,
  lessonId: string,
  lessonNumber: number,
) {
  const userId = await requireUser();

  const existing = await db
    .select({ id: modelMastery.id })
    .from(modelMastery)
    .where(
      and(eq(modelMastery.userId, userId), eq(modelMastery.modelId, modelId)),
    )
    .limit(1);

  let xpAwarded = false;
  if (existing.length > 0) {
    await db
      .delete(modelMastery)
      .where(
        and(eq(modelMastery.userId, userId), eq(modelMastery.modelId, modelId)),
      );
  } else {
    await db.insert(modelMastery).values({ userId, modelId });
    await ensureStarted(userId, lessonId);
    xpAwarded = await awardXpOnce(userId, "model_mastered", modelId);
  }

  const newBadges =
    existing.length === 0 ? await checkAndAwardBadges(userId) : [];
  revalidateLesson(lessonNumber);
  return {
    mastered: existing.length === 0,
    xp: xpAwarded ? XP.model_mastered : 0,
    newBadges,
  };
}

/** Save homework done-state + notes. Awards XP once on first completion. */
export async function setHomework(
  lessonId: string,
  done: boolean,
  notes: string,
  lessonNumber: number,
) {
  const userId = await requireUser();

  await db
    .insert(homeworkStatus)
    .values({
      userId,
      lessonId,
      done,
      notes: notes || null,
      doneAt: done ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [homeworkStatus.userId, homeworkStatus.lessonId],
      set: { done, notes: notes || null, doneAt: done ? new Date() : null },
    });

  await ensureStarted(userId, lessonId);
  const xpAwarded = done
    ? await awardXpOnce(userId, "homework_done", lessonId)
    : false;

  const newBadges = done ? await checkAndAwardBadges(userId) : [];
  revalidateLesson(lessonNumber);
  return { done, xp: xpAwarded ? XP.homework_done : 0, newBadges };
}

/** Log (or clear) "taught one person" for a lesson. Awards XP once. */
export async function toggleTeach(
  lessonId: string,
  taughtWho: string,
  lessonNumber: number,
) {
  const userId = await requireUser();

  const existing = await db
    .select({ id: teachLog.id })
    .from(teachLog)
    .where(and(eq(teachLog.userId, userId), eq(teachLog.lessonId, lessonId)))
    .limit(1);

  let xpAwarded = false;
  if (existing.length > 0) {
    await db
      .delete(teachLog)
      .where(and(eq(teachLog.userId, userId), eq(teachLog.lessonId, lessonId)));
  } else {
    await db.insert(teachLog).values({
      userId,
      lessonId,
      taughtWho: taughtWho || null,
    });
    await ensureStarted(userId, lessonId);
    xpAwarded = await awardXpOnce(userId, "taught_someone", lessonId);
  }

  const newBadges =
    existing.length === 0 ? await checkAndAwardBadges(userId) : [];
  revalidateLesson(lessonNumber);
  return {
    taught: existing.length === 0,
    xp: xpAwarded ? XP.taught_someone : 0,
    newBadges,
  };
}

/** Mark a lesson complete. Unlocks the next lesson; awards XP once. */
export async function completeLesson(lessonId: string, lessonNumber: number) {
  const userId = await requireUser();

  await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status: "completed", completedAt: new Date() },
    });

  const awarded = await awardXpOnce(userId, "lesson_complete", lessonId);

  const newBadges = await checkAndAwardBadges(userId);
  revalidateLesson(lessonNumber);
  return {
    completed: true,
    xpAwarded: awarded ? XP.lesson_complete : 0,
    newBadges,
  };
}

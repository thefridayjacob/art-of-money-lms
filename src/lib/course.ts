import { db } from "@/db";
import { eq, asc, and, inArray } from "drizzle-orm";
import {
  parts,
  lessons,
  lessonProgress,
  models,
  resources,
  modelMastery,
  resourceOpens,
  homeworkStatus,
  teachLog,
} from "@/db/schema";

export type LessonStatus = "not_started" | "in_progress" | "completed";

export type CourseMapLesson = {
  id: string;
  number: number;
  slug: string;
  title: string;
  bigIdea: string | null;
  modelCount: number;
  status: LessonStatus;
  unlocked: boolean;
};

export type CourseMapPart = {
  id: string;
  number: number;
  title: string;
  lessons: CourseMapLesson[];
};

/**
 * Full course map with per-user status + unlock state.
 * Unlock rule: Lesson 1 is always open; every other lesson opens once the
 * previous one is completed. Admins see everything unlocked.
 */
export async function getCourseMap(
  userId: string | null,
  isAdmin = false,
): Promise<CourseMapPart[]> {
  const partRows = await db.query.parts.findMany({
    orderBy: [asc(parts.number)],
    with: {
      lessons: {
        orderBy: [asc(lessons.number)],
        with: { models: { columns: { id: true } } },
      },
    },
  });

  // progress map
  const progress = userId
    ? await db
        .select({
          lessonId: lessonProgress.lessonId,
          status: lessonProgress.status,
        })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId))
    : [];
  const statusByLesson = new Map<string, LessonStatus>(
    progress.map((p) => [p.lessonId, p.status]),
  );

  // Flatten in lesson-number order to compute sequential unlock
  const flat = partRows
    .flatMap((p) => p.lessons)
    .sort((a, b) => a.number - b.number);
  const completed = new Set(
    flat.filter((l) => statusByLesson.get(l.id) === "completed").map((l) => l.number),
  );

  const unlockedFor = (number: number) =>
    isAdmin || number === 1 || completed.has(number - 1);

  return partRows.map((p) => ({
    id: p.id,
    number: p.number,
    title: p.title,
    lessons: p.lessons.map((l) => ({
      id: l.id,
      number: l.number,
      slug: l.slug,
      title: l.title,
      bigIdea: l.bigIdea,
      modelCount: l.models.length,
      status: statusByLesson.get(l.id) ?? "not_started",
      unlocked: unlockedFor(l.number),
    })),
  }));
}

export type FullLesson = Awaited<ReturnType<typeof getLesson>>;

/** A single lesson with its models + resources, plus this user's per-item
 * progress (opened resources, mastered models, homework, teach). */
export async function getLesson(number: number, userId: string | null) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.number, number),
    with: {
      part: true,
      models: { orderBy: [asc(models.number)] },
      resources: { orderBy: [asc(resources.sort)] },
    },
  });
  if (!lesson) return null;

  const modelIds = lesson.models.map((m) => m.id);
  const resourceIds = lesson.resources.map((r) => r.id);

  let masteredModels = new Set<string>();
  let openedResources = new Set<string>();
  let homeworkDone = false;
  let homeworkNotes: string | null = null;
  let taught = false;
  let status: LessonStatus = "not_started";

  if (userId) {
    const [masteryRows, openRows, hwRow, teachRow, progRow] = await Promise.all([
      modelIds.length
        ? db
            .select({ modelId: modelMastery.modelId })
            .from(modelMastery)
            .where(
              and(
                eq(modelMastery.userId, userId),
                inArray(modelMastery.modelId, modelIds),
              ),
            )
        : Promise.resolve([]),
      resourceIds.length
        ? db
            .select({ resourceId: resourceOpens.resourceId })
            .from(resourceOpens)
            .where(
              and(
                eq(resourceOpens.userId, userId),
                inArray(resourceOpens.resourceId, resourceIds),
              ),
            )
        : Promise.resolve([]),
      db
        .select()
        .from(homeworkStatus)
        .where(
          and(
            eq(homeworkStatus.userId, userId),
            eq(homeworkStatus.lessonId, lesson.id),
          ),
        )
        .limit(1),
      db
        .select()
        .from(teachLog)
        .where(
          and(eq(teachLog.userId, userId), eq(teachLog.lessonId, lesson.id)),
        )
        .limit(1),
      db
        .select({ status: lessonProgress.status })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.lessonId, lesson.id),
          ),
        )
        .limit(1),
    ]);

    masteredModels = new Set(masteryRows.map((r) => r.modelId));
    openedResources = new Set(openRows.map((r) => r.resourceId));
    homeworkDone = hwRow[0]?.done ?? false;
    homeworkNotes = hwRow[0]?.notes ?? null;
    taught = teachRow.length > 0;
    status = progRow[0]?.status ?? "not_started";
  }

  return {
    ...lesson,
    userState: {
      status,
      masteredModels,
      openedResources,
      homeworkDone,
      homeworkNotes,
      taught,
    },
  };
}

/** Total lesson count + previous/next lesson numbers for nav. */
export async function getLessonNav(number: number) {
  const all = await db
    .select({ number: lessons.number, title: lessons.title })
    .from(lessons)
    .orderBy(asc(lessons.number));
  const idx = all.findIndex((l) => l.number === number);
  return {
    total: all.length,
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  };
}

/** Whether a lesson is unlocked for a user (server-side gate). */
export async function isLessonUnlocked(
  number: number,
  userId: string | null,
  isAdmin = false,
): Promise<boolean> {
  if (isAdmin || number === 1) return true;
  if (!userId) return false;
  const prev = await db.query.lessons.findFirst({
    where: eq(lessons.number, number - 1),
    columns: { id: true },
  });
  if (!prev) return false;
  const rows = await db
    .select({ status: lessonProgress.status })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, prev.id),
      ),
    )
    .limit(1);
  return rows[0]?.status === "completed";
}

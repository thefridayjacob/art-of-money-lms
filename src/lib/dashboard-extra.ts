import { db } from "@/db";
import { and, asc, eq, gte } from "drizzle-orm";
import {
  lessons,
  resources,
  lessonProgress,
  models,
  modelMastery,
  xpEvents,
} from "@/db/schema";
import { classifyResource } from "@/lib/resource-media";
import { XP } from "@/lib/xp";

/** Start of "today" in Africa/Lagos (UTC+1, no DST) as a UTC instant. */
function lagosTodayStart(): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${ymd}T00:00:00+01:00`);
}

export type ContinueCard = {
  number: number;
  title: string;
  partTitle: string;
  thumb: string | null;
  masteredModels: number;
  totalModels: number;
  pct: number;
  status: "not_started" | "in_progress" | "completed";
};

/**
 * The next few lessons to pick up: the lowest-numbered not-yet-completed
 * lessons, each with a real video thumbnail and how far through it the user is
 * (models mastered / total).
 */
export async function getContinueLearning(
  userId: string,
  limit = 3,
): Promise<ContinueCard[]> {
  const [lessonRows, progressRows, masteryRows, modelRows] = await Promise.all([
    db.query.lessons.findMany({
      orderBy: [asc(lessons.number)],
      with: {
        part: { columns: { title: true } },
        resources: {
          columns: { url: true, kind: true, sort: true },
          orderBy: [asc(resources.sort)],
        },
      },
    }),
    db
      .select({ lessonId: lessonProgress.lessonId, status: lessonProgress.status })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId)),
    db
      .select({ modelId: modelMastery.modelId })
      .from(modelMastery)
      .where(eq(modelMastery.userId, userId)),
    db
      .select({ id: models.id, lessonId: models.lessonId })
      .from(models),
  ]);

  const statusByLesson = new Map(progressRows.map((p) => [p.lessonId, p.status]));
  const masteredIds = new Set(masteryRows.map((m) => m.modelId));
  const modelsByLesson = new Map<string, string[]>();
  for (const m of modelRows) {
    const arr = modelsByLesson.get(m.lessonId) ?? [];
    arr.push(m.id);
    modelsByLesson.set(m.lessonId, arr);
  }

  const cards: ContinueCard[] = [];
  for (const l of lessonRows) {
    const status = (statusByLesson.get(l.id) ?? "not_started") as ContinueCard["status"];
    if (status === "completed") continue;

    const lessonModelIds = modelsByLesson.get(l.id) ?? [];
    const mastered = lessonModelIds.filter((id) => masteredIds.has(id)).length;
    const total = lessonModelIds.length;

    // first watch resource that is a real video (has a thumbnail)
    let thumb: string | null = null;
    for (const r of l.resources) {
      if (r.kind !== "watch") continue;
      const media = classifyResource(r.url);
      if (media.type === "video" && media.thumb) {
        thumb = media.thumb;
        break;
      }
    }

    cards.push({
      number: l.number,
      title: l.title,
      partTitle: l.part.title,
      thumb,
      masteredModels: mastered,
      totalModels: total,
      pct: total ? mastered / total : 0,
      status,
    });
    if (cards.length >= limit) break;
  }
  return cards;
}

export type TodayGoal = {
  key: string;
  label: string;
  points: number;
  done: boolean;
};

/**
 * Today's gamified goals: lights up as the user earns each kind of XP today
 * (Africa/Lagos day). Reads the xp_events ledger, no separate quest storage.
 */
export async function getTodayGoals(userId: string): Promise<{
  goals: TodayGoal[];
  doneCount: number;
  total: number;
}> {
  const start = lagosTodayStart();
  const rows = await db
    .select({ kind: xpEvents.kind })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, start)));
  const kindsToday = new Set<string>(rows.map((r) => r.kind));

  const defs: { key: string; label: string; points: number }[] = [
    { key: "resource_opened", label: "Open a video or book", points: XP.resource_opened },
    { key: "model_mastered", label: "Master a model", points: XP.model_mastered },
    { key: "homework_done", label: "Do a lesson's homework", points: XP.homework_done },
    { key: "lesson_complete", label: "Finish a lesson", points: XP.lesson_complete },
  ];

  const goals = defs.map((g) => ({ ...g, done: kindsToday.has(g.key) }));
  return {
    goals,
    doneCount: goals.filter((g) => g.done).length,
    total: goals.length,
  };
}

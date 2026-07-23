import { db } from "@/db";
import { asc, eq } from "drizzle-orm";
import { models, lessons, modelMastery } from "@/db/schema";

export async function getDeck(userId: string | null) {
  const rows = await db
    .select({
      id: models.id,
      number: models.number,
      title: models.title,
      body: models.body,
      lessonId: lessons.id,
      lessonNumber: lessons.number,
      lessonTitle: lessons.title,
    })
    .from(models)
    .innerJoin(lessons, eq(lessons.id, models.lessonId))
    .orderBy(asc(models.number));

  const mastered = userId
    ? new Set(
        (
          await db
            .select({ modelId: modelMastery.modelId })
            .from(modelMastery)
            .where(eq(modelMastery.userId, userId))
        ).map((r) => r.modelId),
      )
    : new Set<string>();

  const cards = rows.map((r) => ({ ...r, mastered: mastered.has(r.id) }));
  return {
    cards,
    masteredCount: cards.filter((c) => c.mastered).length,
    total: cards.length,
  };
}

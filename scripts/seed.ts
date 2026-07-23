/**
 * Seeds the database from content/course.md and the badge catalog.
 * Reseed-safe: uses upserts on natural keys, so re-running never wipes
 * user progress. Run with: npm run db:seed
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";

config({ path: ".env.local" });

async function main() {
  // Imported inside main() so dotenv loads before db/index.ts reads env.
  const { db, schema } = await import("../src/db");
  const { parseCourse } = await import("../src/db/parse-course");
  const { BADGES } = await import("../src/db/badges");

  const md = readFileSync("content/course.md", "utf8");
  const parts = parseCourse(md);

  let lessonCount = 0;
  let modelCount = 0;
  let resourceCount = 0;

  for (const part of parts) {
    const [partRow] = await db
      .insert(schema.parts)
      .values({ number: part.number, slug: part.slug, title: part.title })
      .onConflictDoUpdate({
        target: schema.parts.number,
        set: { slug: part.slug, title: part.title },
      })
      .returning();

    for (const lesson of part.lessons) {
      const [lessonRow] = await db
        .insert(schema.lessons)
        .values({
          partId: partRow.id,
          number: lesson.number,
          slug: lesson.slug,
          title: lesson.title,
          bigIdea: lesson.bigIdea,
          startHere: lesson.startHere,
          nigeriaCheck: lesson.nigeriaCheck,
          homework: lesson.homework,
          recap: lesson.recap,
        })
        .onConflictDoUpdate({
          target: schema.lessons.number,
          set: {
            partId: partRow.id,
            slug: lesson.slug,
            title: lesson.title,
            bigIdea: lesson.bigIdea,
            startHere: lesson.startHere,
            nigeriaCheck: lesson.nigeriaCheck,
            homework: lesson.homework,
            recap: lesson.recap,
          },
        })
        .returning();
      lessonCount++;

      for (const model of lesson.models) {
        await db
          .insert(schema.models)
          .values({
            lessonId: lessonRow.id,
            number: model.number,
            title: model.title,
            body: model.body,
            sort: model.sort,
          })
          .onConflictDoUpdate({
            target: schema.models.number,
            set: {
              lessonId: lessonRow.id,
              title: model.title,
              body: model.body,
              sort: model.sort,
            },
          });
        modelCount++;
      }

      for (const r of lesson.resources) {
        await db
          .insert(schema.resources)
          .values({
            lessonId: lessonRow.id,
            kind: r.kind,
            title: r.title,
            url: r.url,
            author: r.author,
            note: r.note,
            sort: r.sort,
          })
          .onConflictDoUpdate({
            target: [
              schema.resources.lessonId,
              schema.resources.kind,
              schema.resources.sort,
            ],
            set: { title: r.title, url: r.url, author: r.author, note: r.note },
          });
        resourceCount++;
      }
    }
  }

  // Badges
  for (const b of BADGES) {
    await db
      .insert(schema.badges)
      .values(b)
      .onConflictDoUpdate({
        target: schema.badges.key,
        set: {
          name: b.name,
          description: b.description,
          emoji: b.emoji,
          criteria: b.criteria,
          threshold: b.threshold,
          color: b.color,
          sort: b.sort,
        },
      });
  }

  console.log(
    `✓ Seeded ${parts.length} parts, ${lessonCount} lessons, ${modelCount} models, ${resourceCount} resources, ${BADGES.length} badges.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { lessons, models, resources } from "@/db/schema";

export type AdminState = { ok?: boolean; error?: string } | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Forbidden");
}

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function nullable(formData: FormData, key: string) {
  const v = str(formData, key).trim();
  return v === "" ? null : v;
}

function revalidateLessonEverywhere(lessonNumber: number) {
  revalidatePath(`/learn/${lessonNumber}`);
  revalidatePath("/learn");
  revalidatePath(`/admin/lessons/${lessonNumber}`);
  revalidatePath("/admin");
  revalidatePath("/deck");
}

export async function updateLesson(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const lessonId = str(formData, "lessonId");
  const lessonNumber = Number(str(formData, "lessonNumber"));
  const title = str(formData, "title").trim();
  if (!lessonId || !title) return { error: "Title is required." };

  await db
    .update(lessons)
    .set({
      title,
      bigIdea: nullable(formData, "bigIdea"),
      startHere: nullable(formData, "startHere"),
      nigeriaCheck: nullable(formData, "nigeriaCheck"),
      homework: nullable(formData, "homework"),
      recap: nullable(formData, "recap"),
    })
    .where(eq(lessons.id, lessonId));

  revalidateLessonEverywhere(lessonNumber);
  return { ok: true };
}

export async function updateModel(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const modelId = str(formData, "modelId");
  const lessonNumber = Number(str(formData, "lessonNumber"));
  const title = str(formData, "title").trim();
  const body = str(formData, "body").trim();
  if (!modelId || !title || !body)
    return { error: "Title and body are required." };

  await db.update(models).set({ title, body }).where(eq(models.id, modelId));
  revalidateLessonEverywhere(lessonNumber);
  return { ok: true };
}

export async function updateResource(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const resourceId = str(formData, "resourceId");
  const lessonNumber = Number(str(formData, "lessonNumber"));
  const title = str(formData, "title").trim();
  const kind = str(formData, "kind") as "watch" | "read" | "article";
  if (!resourceId || !title) return { error: "Title is required." };
  if (!["watch", "read", "article"].includes(kind))
    return { error: "Invalid kind." };

  await db
    .update(resources)
    .set({
      title,
      kind,
      url: nullable(formData, "url"),
      author: nullable(formData, "author"),
      note: nullable(formData, "note"),
    })
    .where(eq(resources.id, resourceId));

  revalidateLessonEverywhere(lessonNumber);
  return { ok: true };
}

export async function deleteResource(formData: FormData) {
  await requireAdmin();
  const resourceId = str(formData, "resourceId");
  const lessonNumber = Number(str(formData, "lessonNumber"));
  if (resourceId) {
    await db.delete(resources).where(eq(resources.id, resourceId));
    revalidateLessonEverywhere(lessonNumber);
  }
}

export async function createResource(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const lessonId = str(formData, "lessonId");
  const lessonNumber = Number(str(formData, "lessonNumber"));
  const title = str(formData, "title").trim();
  const kind = str(formData, "kind") as "watch" | "read" | "article";
  if (!lessonId || !title) return { error: "Title is required." };
  if (!["watch", "read", "article"].includes(kind))
    return { error: "Pick a type." };

  // next sort index within this lesson+kind (natural key is lessonId,kind,sort)
  const [{ nextSort }] = await db
    .select({
      nextSort: sql<number>`coalesce(max(${resources.sort}) + 1, 0)`,
    })
    .from(resources)
    .where(and(eq(resources.lessonId, lessonId), eq(resources.kind, kind)));

  await db.insert(resources).values({
    lessonId,
    kind,
    title,
    url: nullable(formData, "url"),
    author: nullable(formData, "author"),
    note: nullable(formData, "note"),
    sort: nextSort,
  });

  revalidateLessonEverywhere(lessonNumber);
  return { ok: true };
}

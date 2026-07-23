import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { db } from "@/db";
import { lessons, models, resources } from "@/db/schema";
import { LessonForm } from "@/components/admin/LessonForm";
import { ModelForm } from "@/components/admin/ModelForm";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { AddResourceForm } from "@/components/admin/AddResourceForm";

export const metadata = { title: "Edit lesson · Admin" };

export default async function AdminLessonPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const { number: numStr } = await params;
  const number = Number(numStr);
  if (!Number.isInteger(number)) notFound();

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.number, number),
    with: {
      models: { orderBy: [asc(models.number)] },
      resources: { orderBy: [asc(resources.kind), asc(resources.sort)] },
    },
  });
  if (!lesson) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} weight="bold" /> All lessons
        </Link>
        <Link
          href={`/learn/${lesson.number}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-teal hover:underline"
        >
          View live <ArrowSquareOut size={13} weight="bold" />
        </Link>
      </div>

      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Lesson {lesson.number}
      </h1>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Lesson</h2>
        <LessonForm lesson={lesson} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Models ({lesson.models.length})
        </h2>
        <div className="space-y-4">
          {lesson.models.map((m) => (
            <ModelForm key={m.id} model={m} lessonNumber={lesson.number} />
          ))}
          {lesson.models.length === 0 && (
            <p className="prose-money text-sm text-muted">
              This lesson has no models.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Resources ({lesson.resources.length})
        </h2>
        <div className="space-y-4">
          {lesson.resources.map((r) => (
            <ResourceForm key={r.id} resource={r} lessonNumber={lesson.number} />
          ))}
          <AddResourceForm lessonId={lesson.id} lessonNumber={lesson.number} />
        </div>
      </section>
    </main>
  );
}

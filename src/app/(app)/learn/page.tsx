import Link from "next/link";
import { auth } from "@/auth";
import { getCourseMap, type CourseMapLesson } from "@/lib/course";

export const metadata = { title: "Your Course · The Art of Money" };

const PART_COLORS = ["teal", "amber", "teal", "pink"] as const;

export default async function LearnPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isAdmin = session?.user?.isAdmin ?? false;

  const map = await getCourseMap(userId, isAdmin);

  const allLessons = map.flatMap((p) => p.lessons);
  const done = allLessons.filter((l) => l.status === "completed").length;
  const pct = Math.round((done / allLessons.length) * 100);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <header className="mb-10">
        <span
          className="peel"
          style={{ backgroundColor: "var(--color-teal)" }}
        >
          {done} / {allLessons.length} lessons
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink">
          Your course
        </h1>
        <p className="prose-money mt-2 max-w-xl text-muted">
          Fifteen lessons, in order, from “what is money” to “how the whole game
          is rigged and what to do about it.” One a week is the pace.
        </p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-teal transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <div className="space-y-10">
        {map.map((part, i) => (
          <section key={part.id}>
            <div className="mb-4 flex items-baseline gap-3">
              <span
                className="peel text-xs"
                style={{
                  backgroundColor: `var(--color-${PART_COLORS[i]})`,
                  color:
                    PART_COLORS[i] === "amber" ? "var(--color-ink)" : "#fff",
                }}
              >
                Part {part.number}
              </span>
              <h2 className="font-display text-lg font-bold text-ink">
                {part.title}
              </h2>
            </div>

            <ul className="space-y-2.5">
              {part.lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

function LessonRow({ lesson }: { lesson: CourseMapLesson }) {
  const isCompleted = lesson.status === "completed";
  const inProgress = lesson.status === "in_progress";

  const inner = (
    <div
      className={`group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition ${
        lesson.unlocked
          ? "border-border bg-card hover:border-teal/50 hover:shadow-sm"
          : "border-transparent bg-ink/[0.03]"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
          isCompleted
            ? "bg-teal text-white"
            : lesson.unlocked
              ? "bg-teal/10 text-teal"
              : "bg-ink/10 text-muted"
        }`}
      >
        {isCompleted ? "✓" : lesson.unlocked ? lesson.number : "🔒"}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`font-display text-sm font-semibold ${
            lesson.unlocked ? "text-ink" : "text-muted"
          }`}
        >
          {lesson.title}
        </p>
        {lesson.bigIdea && lesson.unlocked && (
          <p className="prose-money mt-0.5 line-clamp-1 text-xs text-muted">
            {lesson.bigIdea}
          </p>
        )}
      </div>

      <div className="shrink-0 font-display text-xs text-muted">
        {inProgress && (
          <span className="mr-2 text-amber-ink">In progress</span>
        )}
        {lesson.modelCount > 0 && `${lesson.modelCount} models`}
      </div>
    </div>
  );

  if (!lesson.unlocked) return <li aria-disabled>{inner}</li>;
  return (
    <li>
      <Link href={`/learn/${lesson.number}`}>{inner}</Link>
    </li>
  );
}

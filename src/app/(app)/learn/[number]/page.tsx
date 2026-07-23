import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLesson, getLessonNav, isLessonUnlocked } from "@/lib/course";
import { Markdown } from "@/components/Markdown";
import { MasterToggle } from "@/components/interactive/MasterToggle";
import { HomeworkPanel } from "@/components/interactive/HomeworkPanel";
import { TeachPanel } from "@/components/interactive/TeachPanel";
import { CompleteLessonButton } from "@/components/interactive/CompleteLessonButton";

type Params = { number: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { number } = await params;
  const lesson = await getLesson(Number(number), null);
  return { title: lesson ? `${lesson.title} · The Art of Money` : "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { number: numStr } = await params;
  const number = Number(numStr);
  if (!Number.isInteger(number)) notFound();

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isAdmin = session?.user?.isAdmin ?? false;

  const unlocked = await isLessonUnlocked(number, userId, isAdmin);
  if (!unlocked) redirect("/learn");

  const [lesson, nav] = await Promise.all([
    getLesson(number, userId),
    getLessonNav(number),
  ]);
  if (!lesson) notFound();

  const watch = lesson.resources.filter((r) => r.kind === "watch");
  const read = lesson.resources.filter((r) => r.kind !== "watch");

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      {/* Breadcrumb + title */}
      <Link
        href="/learn"
        className="font-display text-xs font-semibold text-muted transition hover:text-ink"
      >
        ← All lessons
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="peel" style={{ backgroundColor: "var(--color-teal)" }}>
          Lesson {lesson.number}
        </span>
        <span className="font-display text-xs font-medium uppercase tracking-wide text-muted">
          Part {lesson.part.number} · {lesson.part.title}
        </span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink">
        {lesson.title}
      </h1>

      {lesson.bigIdea && (
        <div className="mt-6 rounded-2xl border-l-4 border-amber bg-amber/10 px-5 py-4">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-amber-ink">
            The Big Idea
          </p>
          <p className="prose-money mt-1 text-lg text-ink">{lesson.bigIdea}</p>
        </div>
      )}

      {/* Start here */}
      {lesson.startHere && (
        <Section>
          <Markdown>{lesson.startHere}</Markdown>
        </Section>
      )}

      {/* Models */}
      {lesson.models.length > 0 && (
        <Section>
          <SectionHeader emoji="🧠" title="The Models" />
          <div className="mt-4 space-y-4">
            {lesson.models.map((m) => {
              const mastered = lesson.userState.masteredModels.has(m.id);
              return (
                <article
                  key={m.id}
                  className={`rounded-2xl border p-5 transition ${
                    mastered
                      ? "border-teal/50 bg-teal/[0.04]"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-7 shrink-0 items-center rounded-full bg-ink px-2.5 font-display text-xs font-bold text-white"
                    >
                      #{m.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-bold text-ink">
                        {m.title}
                      </h3>
                      <div className="mt-1">
                        <Markdown>{m.body}</Markdown>
                      </div>
                      <div className="mt-3">
                        <MasterToggle
                          modelId={m.id}
                          lessonId={lesson.id}
                          lessonNumber={lesson.number}
                          initialMastered={mastered}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
      )}

      {/* Nigeria Check */}
      {lesson.nigeriaCheck && (
        <Section>
          <SectionHeader emoji="🇳🇬" title="Nigeria Check" />
          <div className="mt-3 rounded-2xl border border-border bg-card p-5">
            <Markdown>{lesson.nigeriaCheck}</Markdown>
          </div>
        </Section>
      )}

      {/* Watch */}
      {watch.length > 0 && (
        <Section>
          <SectionHeader emoji="📺" title="Watch" />
          <ul className="mt-3 space-y-2.5">
            {watch.map((r) => (
              <ResourceItem
                key={r.id}
                r={r}
                opened={lesson.userState.openedResources.has(r.id)}
              />
            ))}
          </ul>
        </Section>
      )}

      {/* Read */}
      {read.length > 0 && (
        <Section>
          <SectionHeader emoji="📚" title="Read" />
          <ul className="mt-3 space-y-2.5">
            {read.map((r) => (
              <ResourceItem
                key={r.id}
                r={r}
                opened={lesson.userState.openedResources.has(r.id)}
              />
            ))}
          </ul>
        </Section>
      )}

      {/* Homework */}
      {lesson.homework && (
        <Section>
          <SectionHeader emoji="✍️" title="Homework" />
          <div className="mt-3">
            <HomeworkPanel
              lessonId={lesson.id}
              lessonNumber={lesson.number}
              homework={lesson.homework}
              initialDone={lesson.userState.homeworkDone}
              initialNotes={lesson.userState.homeworkNotes}
            />
          </div>
        </Section>
      )}

      {/* Teach one person */}
      <Section>
        <SectionHeader emoji="🗣️" title="Each one, teach one" />
        <div className="mt-3">
          <TeachPanel
            lessonId={lesson.id}
            lessonNumber={lesson.number}
            initialTaught={lesson.userState.taught}
          />
        </div>
      </Section>

      {/* Recap */}
      {lesson.recap && (
        <Section>
          <div className="rounded-2xl bg-ink px-5 py-4">
            <p className="font-display text-xs font-bold uppercase tracking-wide text-teal-bright">
              ⚡ One-minute recap
            </p>
            <p className="prose-money mt-1 text-chalk">{lesson.recap}</p>
          </div>
        </Section>
      )}

      {/* Complete */}
      <CompleteLessonButton
        lessonId={lesson.id}
        lessonNumber={lesson.number}
        initialCompleted={lesson.userState.status === "completed"}
        next={nav.next}
      />

      {/* Nav */}
      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
        {nav.prev ? (
          <Link
            href={`/learn/${nav.prev.number}`}
            className="group flex-1 rounded-2xl border border-border p-4 transition hover:border-teal/50"
          >
            <p className="font-display text-xs text-muted">← Previous</p>
            <p className="font-display text-sm font-semibold text-ink">
              {nav.prev.title}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nav.next ? (
          <Link
            href={`/learn/${nav.next.number}`}
            className="group flex-1 rounded-2xl border border-border p-4 text-right transition hover:border-teal/50"
          >
            <p className="font-display text-xs text-muted">Next →</p>
            <p className="font-display text-sm font-semibold text-ink">
              {nav.next.title}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </main>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="mt-8">{children}</section>;
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
      <span aria-hidden>{emoji}</span> {title}
    </h2>
  );
}

function ResourceItem({
  r,
  opened,
}: {
  r: {
    id: string;
    title: string;
    url: string | null;
    author: string | null;
    note: string | null;
  };
  opened: boolean;
}) {
  const content = (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 transition hover:shadow-sm ${
        opened
          ? "border-teal/40 bg-teal/[0.04]"
          : "border-border bg-card hover:border-teal/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-ink">
          {r.title}
          {r.author && <span className="text-muted"> — {r.author}</span>}
        </p>
        {r.note && (
          <p className="prose-money mt-1 text-xs italic text-muted">{r.note}</p>
        )}
      </div>
      {r.url && (
        <span className="shrink-0 font-display text-xs font-semibold text-teal">
          {opened ? "Opened ✓" : "Open ↗"}
        </span>
      )}
    </div>
  );

  if (r.url) {
    // Route through /go/[id] so the open is tracked (and awards XP once).
    return (
      <li>
        <a href={`/go/${r.id}`} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      </li>
    );
  }
  return <li>{content}</li>;
}

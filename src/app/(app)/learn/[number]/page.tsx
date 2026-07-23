import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Brain,
  CurrencyNgn,
  Television,
  BookOpen,
  NotePencil,
  UsersThree,
  Lightning,
  Lightbulb,
  ArrowLeft,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { getLesson, getLessonNav, isLessonUnlocked } from "@/lib/course";
import { Markdown } from "@/components/Markdown";
import { MasterToggle } from "@/components/interactive/MasterToggle";
import { HomeworkPanel } from "@/components/interactive/HomeworkPanel";
import { TeachPanel } from "@/components/interactive/TeachPanel";
import { CompleteLessonButton } from "@/components/interactive/CompleteLessonButton";
import { WatchCard } from "@/components/lesson/WatchCard";
import { ReadCard } from "@/components/lesson/ReadCard";

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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft size={14} weight="bold" /> All lessons
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <span className="peel" style={{ backgroundColor: "var(--color-teal)" }}>
          Lesson {lesson.number}
        </span>
        <span className="font-display text-xs font-medium uppercase tracking-wide text-muted">
          Part {lesson.part.number} · {lesson.part.title}
        </span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-4xl">
        {lesson.title}
      </h1>

      {lesson.bigIdea && (
        <div className="mt-6 flex gap-3.5 rounded-2xl border-l-4 border-amber bg-amber/10 px-5 py-4">
          <Lightbulb
            size={22}
            weight="duotone"
            className="mt-0.5 shrink-0 text-amber-ink"
          />
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wide text-amber-ink">
              The Big Idea
            </p>
            <p className="prose-money mt-1 text-lg text-ink">{lesson.bigIdea}</p>
          </div>
        </div>
      )}

      {lesson.startHere && (
        <Section>
          <Markdown>{lesson.startHere}</Markdown>
        </Section>
      )}

      {/* Models */}
      {lesson.models.length > 0 && (
        <Section>
          <SectionHeader icon={<Brain size={22} weight="duotone" />} title="The Models" />
          <div className="mt-4 space-y-4">
            {lesson.models.map((m) => {
              const mastered = lesson.userState.masteredModels.has(m.id);
              return (
                <article
                  key={m.id}
                  className={`rounded-2xl border p-4 transition sm:p-5 ${
                    mastered ? "border-teal/50 bg-teal/[0.04]" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 shrink-0 items-center rounded-full bg-ink px-2.5 font-display text-xs font-bold text-white">
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
          <SectionHeader
            icon={<CurrencyNgn size={22} weight="duotone" />}
            title="Nigeria Check"
          />
          <div className="mt-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <Markdown>{lesson.nigeriaCheck}</Markdown>
          </div>
        </Section>
      )}

      {/* Watch */}
      {watch.length > 0 && (
        <Section>
          <SectionHeader
            icon={<Television size={22} weight="duotone" />}
            title="Watch"
          />
          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {watch.map((r) => (
              <WatchCard
                key={r.id}
                r={r}
                opened={lesson.userState.openedResources.has(r.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Read */}
      {read.length > 0 && (
        <Section>
          <SectionHeader icon={<BookOpen size={22} weight="duotone" />} title="Read" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {read.map((r) => (
              <ReadCard
                key={r.id}
                r={r}
                opened={lesson.userState.openedResources.has(r.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Homework */}
      {lesson.homework && (
        <Section>
          <SectionHeader
            icon={<NotePencil size={22} weight="duotone" />}
            title="Homework"
          />
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
        <SectionHeader
          icon={<UsersThree size={22} weight="duotone" />}
          title="Each one, teach one"
        />
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
            <p className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wide text-teal-bright">
              <Lightning size={14} weight="fill" /> One-minute recap
            </p>
            <p className="prose-money mt-1 text-chalk">{lesson.recap}</p>
          </div>
        </Section>
      )}

      <CompleteLessonButton
        lessonId={lesson.id}
        lessonNumber={lesson.number}
        initialCompleted={lesson.userState.status === "completed"}
        next={nav.next}
      />

      {/* Prev / Next */}
      <nav className="mt-12 flex items-stretch justify-between gap-3 border-t border-border pt-6">
        {nav.prev ? (
          <Link
            href={`/learn/${nav.prev.number}`}
            className="press flex flex-1 items-center gap-2 rounded-2xl border border-border p-4 transition hover:border-teal/50"
          >
            <CaretLeft size={16} weight="bold" className="shrink-0 text-muted" />
            <span className="min-w-0">
              <span className="block font-display text-xs text-muted">Previous</span>
              <span className="block truncate font-display text-sm font-semibold text-ink">
                {nav.prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nav.next ? (
          <Link
            href={`/learn/${nav.next.number}`}
            className="press flex flex-1 items-center justify-end gap-2 rounded-2xl border border-border p-4 text-right transition hover:border-teal/50"
          >
            <span className="min-w-0">
              <span className="block font-display text-xs text-muted">Next</span>
              <span className="block truncate font-display text-sm font-semibold text-ink">
                {nav.next.title}
              </span>
            </span>
            <CaretRight size={16} weight="bold" className="shrink-0 text-muted" />
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

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
      <span className="text-teal" aria-hidden>
        {icon}
      </span>
      {title}
    </h2>
  );
}

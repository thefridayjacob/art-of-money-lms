import Link from "next/link";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import {
  CaretRight,
  PencilSimple,
  Users as UsersIcon,
  Ticket,
  Bank,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { db } from "@/db";
import { parts, lessons } from "@/db/schema";

export const metadata = { title: "Admin · The Art of Money" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const partRows = await db.query.parts.findMany({
    orderBy: [asc(parts.number)],
    with: {
      lessons: {
        orderBy: [asc(lessons.number)],
        with: {
          models: { columns: { id: true } },
          resources: { columns: { id: true } },
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex items-center gap-2">
        <PencilSimple size={22} weight="duotone" className="text-teal" />
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Content editor
        </h1>
      </div>
      <p className="prose-money mt-1 text-muted">
        Edit any lesson, model, or resource. Changes go live for learners
        immediately.
      </p>

      <Link
        href="/admin/users"
        className="press mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-teal/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10">
          <UsersIcon size={18} weight="duotone" className="text-teal" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-semibold text-ink">
            Members
          </span>
          <span className="font-display text-xs text-muted">
            View, manage, and remove people who have accounts
          </span>
        </span>
        <CaretRight size={16} weight="bold" className="text-muted" />
      </Link>

      <Link
        href="/admin/codes"
        className="press mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-teal/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10">
          <Ticket size={18} weight="duotone" className="text-teal" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-semibold text-ink">
            Access codes
          </span>
          <span className="font-display text-xs text-muted">
            Generate codes to sell on Selar; buyers redeem to unlock
          </span>
        </span>
        <CaretRight size={16} weight="bold" className="text-muted" />
      </Link>

      <Link
        href="/admin/payments"
        className="press mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-teal/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10">
          <Bank size={18} weight="duotone" className="text-teal" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-semibold text-ink">
            Payments
          </span>
          <span className="font-display text-xs text-muted">
            Bank-transfer details &amp; confirm transfers to unlock buyers
          </span>
        </span>
        <CaretRight size={16} weight="bold" className="text-muted" />
      </Link>

      <div className="mt-8 space-y-8">
        {partRows.map((part) => (
          <section key={part.id}>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">
              Part {part.number} · {part.title}
            </h2>
            <ul className="space-y-2">
              {part.lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/lessons/${l.number}`}
                    className="press flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-teal/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xs font-bold text-white">
                      {l.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-semibold text-ink">
                        {l.title}
                      </span>
                      <span className="font-display text-xs text-muted">
                        {l.models.length} models · {l.resources.length} resources
                      </span>
                    </span>
                    <CaretRight size={16} weight="bold" className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

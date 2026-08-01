import Link from "next/link";
import { redirect } from "next/navigation";
import { CaretLeft, Ticket } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { listCodes } from "@/lib/code-actions";
import { CodeManager, type CodeRow } from "@/components/admin/CodeManager";

export const metadata = { title: "Access codes · The Art of Money" };

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "Africa/Lagos",
});

export default async function AdminCodesPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const rows = await listCodes();
  const codes: CodeRow[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    note: c.note,
    used: !!c.usedByUserId,
    usedAt: c.usedAt ? fmt.format(c.usedAt) : null,
    createdAt: fmt.format(c.createdAt),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 font-display text-xs font-semibold text-muted transition hover:text-ink"
      >
        <CaretLeft size={14} weight="bold" /> Content editor
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <Ticket size={22} weight="duotone" className="text-teal" />
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Access codes
        </h1>
      </div>
      <p className="prose-money mt-1 text-muted">
        Sell these on Selar (or hand them out). A buyer enters their code on the
        unlock page to get instant access — no payment integration required.
      </p>

      <div className="mt-6">
        <CodeManager codes={codes} />
      </div>
    </main>
  );
}

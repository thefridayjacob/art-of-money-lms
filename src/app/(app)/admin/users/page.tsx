import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { CaretLeft, Users as UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { db } from "@/db";
import { accounts, userStats, users } from "@/db/schema";
import { UserRow, type AdminUser } from "@/components/admin/UserRow";

export const metadata = { title: "Members · The Art of Money" };

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Africa/Lagos",
});
const fmtDate = (d: Date | string | null) => (d ? fmt.format(new Date(d)) : null);

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  // All members, most-recently-active first (nulls last), then newest.
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      displayName: users.displayName,
      isAdmin: users.isAdmin,
      hasAccess: users.hasAccess,
      passwordHash: users.passwordHash,
      createdAt: users.createdAt,
      xp: userStats.xp,
      streak: userStats.currentStreak,
      lastActive: userStats.lastActiveDate,
    })
    .from(users)
    .leftJoin(userStats, eq(userStats.userId, users.id))
    .orderBy(
      sql`${userStats.lastActiveDate} desc nulls last`,
      desc(users.createdAt),
    );

  // Which users have a Google (OAuth) account row.
  const googleRows = await db
    .selectDistinct({ userId: accounts.userId })
    .from(accounts)
    .where(eq(accounts.provider, "google"));
  const googleIds = new Set(googleRows.map((r) => r.userId));

  const totalXp = rows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const paidCount = rows.filter((r) => r.hasAccess).length;
  const activeThisWeek = rows.filter((r) => {
    if (!r.lastActive) return false;
    const days =
      (Date.now() - new Date(r.lastActive).getTime()) / 86_400_000;
    return days <= 7;
  }).length;

  const list: AdminUser[] = rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    displayName: r.displayName,
    isAdmin: r.isAdmin,
    hasAccess: r.hasAccess,
    hasPassword: !!r.passwordHash,
    hasGoogle: googleIds.has(r.id),
    xp: r.xp ?? 0,
    streak: r.streak ?? 0,
    lastActive: fmtDate(r.lastActive),
    joined: fmtDate(r.createdAt) ?? "—",
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
        <UsersIcon size={22} weight="duotone" className="text-teal" />
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Members
        </h1>
      </div>
      <p className="prose-money mt-1 text-muted">
        Everyone with an account. Grant admin, or remove a member and all their
        data.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Members" value={list.length} />
        <Stat label="Paid" value={paidCount} />
        <Stat label="Active this week" value={activeThisWeek} />
        <Stat label="Total XP" value={totalXp} />
      </div>

      <ul className="mt-6 space-y-3">
        {list.map((u) => (
          <UserRow key={u.id} user={u} isSelf={u.id === session.user.id} />
        ))}
      </ul>

      {list.length === 0 && (
        <p className="mt-8 text-center font-display text-sm text-muted">
          No members yet.
        </p>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="font-display text-2xl font-extrabold text-ink">
        {value.toLocaleString("en-US")}
      </div>
      <div className="font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}

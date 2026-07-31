"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type UserAdminState = { ok?: string; error?: string } | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Forbidden");
  return session.user;
}

/** Permanently delete a user and everything they own (progress, stats, badges,
 * accounts, sessions — all cascade via foreign keys). Admins cannot delete
 * themselves. */
export async function deleteUser(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  const me = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Missing user." };
  if (userId === me.id)
    return { error: "You can't delete your own account here." };

  const [row] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ email: users.email });

  revalidatePath("/admin/users");
  if (!row) return { error: "That user no longer exists." };
  return { ok: `Deleted ${row.email}.` };
}

/** Grant or revoke admin. Guards against removing the last admin and against
 * an admin revoking their own access (which would lock them out). */
export async function setAdmin(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  const me = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const makeAdmin = String(formData.get("makeAdmin") ?? "") === "true";
  if (!userId) return { error: "Missing user." };

  if (!makeAdmin) {
    if (userId === me.id)
      return { error: "You can't remove your own admin access." };
    // Never leave the site with zero admins.
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.isAdmin, true), ne(users.id, userId)));
    if (count < 1) return { error: "There must be at least one admin." };
  }

  await db.update(users).set({ isAdmin: makeAdmin }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { ok: makeAdmin ? "Admin access granted." : "Admin access removed." };
}

/** Manually grant or revoke paid course access (e.g. a comp, a manual bank
 * transfer, or a refund). */
export async function setAccess(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const grant = String(formData.get("grant") ?? "") === "true";
  if (!userId) return { error: "Missing user." };

  await db
    .update(users)
    .set({
      hasAccess: grant,
      accessGrantedAt: grant ? new Date() : null,
    })
    .where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { ok: grant ? "Course access granted." : "Course access revoked." };
}

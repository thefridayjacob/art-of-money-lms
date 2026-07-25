"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type AccountState = { ok?: string; error?: string } | undefined;

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

/** Update display name + marketing preference. */
export async function updateProfile(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const userId = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const marketing = formData.get("marketing") === "on";

  await db
    .update(users)
    .set({
      name: name || null,
      displayName: name || null,
      marketingOptIn: marketing,
      marketingOptInAt: marketing ? new Date() : null,
    })
    .where(eq(users.id, userId));

  revalidatePath("/settings");
  return { ok: "Profile saved." };
}

/**
 * Change password (verifies current) or set one for the first time (Google
 * accounts with no password yet — no current required).
 */
export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const userId = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 8)
    return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords don't match." };

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return { error: "Account not found." };

  if (user.passwordHash) {
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) return { error: "Current password is wrong." };
  }

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(next, 10) })
    .where(eq(users.id, userId));

  return {
    ok: user.passwordHash ? "Password changed." : "Password set.",
  };
}

/** Whether the signed-in user already has a password (drives the UI). */
export async function currentUserHasPassword(): Promise<boolean> {
  const userId = await requireUser();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { passwordHash: true },
  });
  return !!user?.passwordHash;
}

import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, users } from "@/db/schema";

/** Grant course access to a user (idempotent). */
export async function grantAccessToUser(userId: string) {
  await db
    .update(users)
    .set({ hasAccess: true, accessGrantedAt: new Date() })
    .where(eq(users.id, userId));
}

/** Grant course access by email (used by the webhook, which only knows email).
 * Idempotent; no-ops if the email has no account. */
export async function grantAccessByEmail(email: string) {
  await db
    .update(users)
    .set({ hasAccess: true, accessGrantedAt: new Date() })
    .where(eq(users.email, email.toLowerCase()));
}

/** Record a confirmed payment against its reference (idempotent-ish upsert of
 * status). */
export async function markPaymentSuccess(args: {
  reference: string;
  channel: string | null;
  paidAt: Date | null;
}) {
  await db
    .update(payments)
    .set({
      status: "success",
      channel: args.channel,
      paidAt: args.paidAt ?? new Date(),
    })
    .where(eq(payments.reference, args.reference));
}

/** True if the user currently has access (fresh read). */
export async function userHasAccess(userId: string): Promise<boolean> {
  const rows = await db
    .select({ hasAccess: users.hasAccess })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0]?.hasAccess ?? false;
}

export const newPaymentReference = () =>
  `aom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

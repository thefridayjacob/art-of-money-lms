"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { newPaymentReference, userHasAccess } from "@/lib/access";
import {
  COURSE_PRICE_KOBO,
  initializeTransaction,
  paystackConfigured,
} from "@/lib/paystack";

export type CheckoutState = { error?: string } | undefined;

async function origin() {
  const h = await headers();
  const host = h.get("host") ?? "learn.fryvstudio.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/** Start a Paystack checkout for the signed-in user and redirect them to the
 * hosted payment page. */
export async function startCheckout(): Promise<CheckoutState> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) redirect("/login");

  // Already paid (or admin) → straight to the course.
  if (user.isAdmin || (await userHasAccess(user.id))) redirect("/dashboard");

  if (!paystackConfigured())
    return { error: "Payments aren’t switched on yet. Please check back soon." };

  const reference = newPaymentReference();
  await db.insert(payments).values({
    reference,
    userId: user.id,
    email: user.email,
    amount: COURSE_PRICE_KOBO,
  });

  const result = await initializeTransaction({
    email: user.email,
    reference,
    callbackUrl: `${await origin()}/api/paystack/callback`,
    metadata: { userId: user.id },
  });

  if (!result.ok) return { error: result.error };

  // redirect() throws internally — must be outside try/catch.
  redirect(result.authorizationUrl);
}

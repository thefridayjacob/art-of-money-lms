import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import {
  grantAccessByEmail,
  grantAccessToUser,
  markPaymentSuccess,
} from "@/lib/access";
import { chargeGrantsAccess, verifyTransaction } from "@/lib/paystack";
import { getPaymentSettings } from "@/lib/settings";

/**
 * Paystack redirects the user here after the hosted checkout. We verify the
 * transaction server-to-server (never trusting the query string), grant access
 * on success, and send them into the course. The webhook is the belt to this
 * route's suspenders — either one grants access idempotently.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/unlock?error=1", req.url));
  }

  const tx = await verifyTransaction(reference);
  const { priceKobo } = await getPaymentSettings();
  if (!tx || !chargeGrantsAccess(tx, priceKobo)) {
    return NextResponse.redirect(new URL("/unlock?error=1", req.url));
  }

  const [row] = await db
    .select({ userId: payments.userId })
    .from(payments)
    .where(eq(payments.reference, reference))
    .limit(1);

  if (row?.userId) await grantAccessToUser(row.userId);
  else if (tx.email) await grantAccessByEmail(tx.email);

  await markPaymentSuccess({
    reference,
    channel: tx.channel,
    paidAt: tx.paidAt,
  });

  return NextResponse.redirect(new URL("/dashboard?unlocked=1", req.url));
}

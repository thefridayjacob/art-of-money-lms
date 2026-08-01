import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import {
  grantAccessByEmail,
  grantAccessToUser,
  markPaymentSuccess,
} from "@/lib/access";
import { chargeGrantsAccess } from "@/lib/paystack";
import { getPaymentSettings } from "@/lib/settings";

const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

/**
 * Paystack webhook. Verifies the HMAC-SHA512 signature over the raw body, then
 * grants access on `charge.success`. Always 200s a well-formed request so
 * Paystack stops retrying; 401s only on a bad/missing signature.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!SECRET || !signature || !verify(raw, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      channel?: string | null;
      paid_at?: string | null;
      customer?: { email?: string };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const d = event.data;
  const reference = d?.reference;
  if (event.event === "charge.success" && d && reference) {
    const { priceKobo } = await getPaymentSettings();
    if (
      chargeGrantsAccess(
        {
          status: d.status ?? "",
          amount: d.amount ?? 0,
          currency: d.currency ?? "",
        },
        priceKobo,
      )
    ) {
      const [row] = await db
        .select({ userId: payments.userId })
        .from(payments)
        .where(eq(payments.reference, reference))
        .limit(1);

      if (row?.userId) await grantAccessToUser(row.userId);
      else if (d.customer?.email) await grantAccessByEmail(d.customer.email);

      await markPaymentSuccess({
        reference,
        channel: d.channel ?? null,
        paidAt: d.paid_at ? new Date(d.paid_at) : null,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

function verify(raw: string, signature: string): boolean {
  const expected = createHmac("sha512", SECRET).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

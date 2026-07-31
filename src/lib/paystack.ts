import "server-only";

/**
 * Paystack integration (server-only). Uses the standard redirect flow:
 * initialize a transaction → send the user to Paystack's hosted checkout →
 * they return to our callback, and a webhook confirms the charge out-of-band.
 */

const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const API = "https://api.paystack.co";

/** Course price in kobo (₦1 = 100 kobo). Configure COURSE_PRICE_KOBO in the
 * environment (e.g. 5000000 = ₦50,000). */
export const COURSE_PRICE_KOBO = Number(process.env.COURSE_PRICE_KOBO ?? 0);
export const COURSE_CURRENCY = "NGN";

export const paystackConfigured = () => SECRET.length > 0 && COURSE_PRICE_KOBO > 0;

/** Format kobo as a Naira string, e.g. 5000000 → "₦50,000". */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: naira % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

type InitResult =
  | { ok: true; authorizationUrl: string }
  | { ok: false; error: string };

export async function initializeTransaction(args: {
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitResult> {
  if (!paystackConfigured())
    return { ok: false, error: "Payments are not configured yet." };

  try {
    const res = await fetch(`${API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: args.email,
        amount: COURSE_PRICE_KOBO,
        currency: COURSE_CURRENCY,
        reference: args.reference,
        callback_url: args.callbackUrl,
        metadata: args.metadata ?? {},
      }),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string };
    };
    if (!json.status || !json.data?.authorization_url)
      return { ok: false, error: json.message || "Could not start checkout." };
    return { ok: true, authorizationUrl: json.data.authorization_url };
  } catch {
    return { ok: false, error: "Could not reach the payment provider." };
  }
}

export type VerifiedTransaction = {
  status: string; // "success" | "failed" | ...
  amount: number; // kobo
  currency: string;
  channel: string | null;
  paidAt: Date | null;
  email: string | null;
  reference: string;
};

export async function verifyTransaction(
  reference: string,
): Promise<VerifiedTransaction | null> {
  if (!SECRET) return null;
  try {
    const res = await fetch(
      `${API}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${SECRET}` },
        cache: "no-store",
      },
    );
    const json = (await res.json()) as {
      status: boolean;
      data?: {
        status: string;
        amount: number;
        currency: string;
        channel: string | null;
        paid_at: string | null;
        reference: string;
        customer?: { email?: string };
      };
    };
    if (!json.status || !json.data) return null;
    const d = json.data;
    return {
      status: d.status,
      amount: d.amount,
      currency: d.currency,
      channel: d.channel,
      paidAt: d.paid_at ? new Date(d.paid_at) : null,
      email: d.customer?.email ?? null,
      reference: d.reference,
    };
  } catch {
    return null;
  }
}

/** A charge is good enough to grant access: succeeded and paid at least the
 * configured price in the right currency. */
export function chargeGrantsAccess(t: {
  status: string;
  amount: number;
  currency: string;
}): boolean {
  return (
    t.status === "success" &&
    t.currency === COURSE_CURRENCY &&
    t.amount >= COURSE_PRICE_KOBO
  );
}

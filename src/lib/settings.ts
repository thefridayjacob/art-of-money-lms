import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

export type PaymentSettings = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  priceKobo: number;
  instructions: string;
};

const KEYS = [
  "pay_bank_name",
  "pay_account_number",
  "pay_account_name",
  "pay_price_kobo",
  "pay_instructions",
] as const;

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const rows = await db
    .select()
    .from(appSettings)
    .where(inArray(appSettings.key, [...KEYS]));
  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));

  const envPrice = Number(process.env.COURSE_PRICE_KOBO ?? 0);
  const priceKobo = Number(map.get("pay_price_kobo")) || envPrice || 0;

  return {
    bankName: map.get("pay_bank_name") ?? "",
    accountNumber: map.get("pay_account_number") ?? "",
    accountName: map.get("pay_account_name") ?? "",
    priceKobo,
    instructions: map.get("pay_instructions") ?? "",
  };
}

/** True once an account number is set — the bank-transfer option is live. */
export function transferConfigured(s: PaymentSettings): boolean {
  return s.accountNumber.trim().length > 0;
}

export async function setSettings(entries: Record<string, string>) {
  const now = new Date();
  for (const [key, value] of Object.entries(entries)) {
    await db
      .insert(appSettings)
      .values({ key, value, updatedAt: now })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value, updatedAt: now },
      });
  }
}

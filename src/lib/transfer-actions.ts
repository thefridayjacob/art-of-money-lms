"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { transferClaims } from "@/db/schema";
import { grantAccessToUser, userHasAccess } from "@/lib/access";
import { setSettings } from "@/lib/settings";

export type TransferState = { ok?: string; error?: string } | undefined;

/* ----------------------------- Buyer ----------------------------- */

/** Record that the signed-in user says they paid by bank transfer. Creates a
 * pending claim for an admin to approve; never grants access on its own. */
export async function submitTransferClaim(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return { error: "Please sign in first." };
  if (user.isAdmin || (await userHasAccess(user.id)))
    return { ok: "You already have access." };

  const senderName = String(formData.get("senderName") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!senderName)
    return { error: "Enter the name on the account you transferred from." };

  // One open claim at a time.
  const [existing] = await db
    .select({ id: transferClaims.id })
    .from(transferClaims)
    .where(
      and(
        eq(transferClaims.userId, user.id),
        eq(transferClaims.status, "pending"),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(transferClaims)
      .set({ senderName, reference, note, createdAt: new Date() })
      .where(eq(transferClaims.id, existing.id));
  } else {
    await db.insert(transferClaims).values({
      userId: user.id,
      email: user.email,
      senderName,
      reference,
      note,
    });
  }

  await notifyAdmin(user.email, senderName).catch(() => {});
  revalidatePath("/unlock");
  revalidatePath("/admin/payments");
  return {
    ok: "Got it — we’ll confirm your transfer and unlock your access shortly.",
  };
}

/** The signed-in user's latest claim status, for the unlock page. */
export async function myClaimStatus(): Promise<
  "pending" | "approved" | "rejected" | null
> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [row] = await db
    .select({ status: transferClaims.status })
    .from(transferClaims)
    .where(eq(transferClaims.userId, session.user.id))
    .orderBy(desc(transferClaims.createdAt))
    .limit(1);
  return (row?.status as "pending" | "approved" | "rejected") ?? null;
}

/* ----------------------------- Admin ----------------------------- */

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Forbidden");
}

export async function listClaims() {
  await requireAdmin();
  return db
    .select()
    .from(transferClaims)
    .orderBy(desc(transferClaims.createdAt))
    .limit(300);
}

/** Approve a claim → grant the claimant access. */
export async function approveClaim(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing claim." };

  const [claim] = await db
    .select({ userId: transferClaims.userId })
    .from(transferClaims)
    .where(eq(transferClaims.id, id))
    .limit(1);
  if (!claim) return { error: "Claim not found." };

  await grantAccessToUser(claim.userId);
  await db
    .update(transferClaims)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(transferClaims.id, id));

  revalidatePath("/admin/payments");
  revalidatePath("/admin/users");
  return { ok: "Approved — access granted." };
}

export async function rejectClaim(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing claim." };
  await db
    .update(transferClaims)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(transferClaims.id, id));
  revalidatePath("/admin/payments");
  return { ok: "Claim rejected." };
}

/** Save bank-transfer details + price (admin). */
export async function savePaymentSettings(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  await requireAdmin();
  const naira = String(formData.get("priceNaira") ?? "").replace(/[^\d.]/g, "");
  const priceKobo = naira ? Math.round(parseFloat(naira) * 100) : 0;

  await setSettings({
    pay_bank_name: String(formData.get("bankName") ?? "").trim(),
    pay_account_number: String(formData.get("accountNumber") ?? "").trim(),
    pay_account_name: String(formData.get("accountName") ?? "").trim(),
    pay_price_kobo: priceKobo ? String(priceKobo) : "",
    pay_instructions: String(formData.get("instructions") ?? "").trim(),
  });

  revalidatePath("/admin/payments");
  revalidatePath("/unlock");
  return { ok: "Payment details saved." };
}

/* --------------------------- helpers ----------------------------- */

async function notifyAdmin(buyerEmail: string, senderName: string) {
  const key = process.env.AUTH_RESEND_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from =
    process.env.EMAIL_FROM ?? "The Art of Money <onboarding@resend.dev>";
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "New bank-transfer claim to confirm",
      html: `<p>A learner says they paid by transfer.</p>
        <p><b>Account:</b> ${buyerEmail}<br/><b>Sender:</b> ${senderName}</p>
        <p>Review and approve in the admin → Payments page.</p>`,
    }),
  });
}

"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { accessCodes } from "@/db/schema";
import { grantAccessToUser, userHasAccess } from "@/lib/access";

export type RedeemState = { ok?: string; error?: string } | undefined;

// Unambiguous alphabet (no 0/O/1/I) for codes people type by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(
      "",
    );
  return `AOM-${block()}-${block()}`;
}

/** Normalise user input: uppercase, strip spaces, ensure the AOM- prefix. */
function normalize(input: string): string {
  let s = input.trim().toUpperCase().replace(/\s+/g, "");
  if (s && !s.startsWith("AOM-")) s = `AOM-${s}`;
  return s;
}

/** Redeem an access code for the signed-in user. One code, one account. */
export async function redeemCode(
  _prev: RedeemState,
  formData: FormData,
): Promise<RedeemState> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return { error: "Please sign in first." };
  if (user.isAdmin || (await userHasAccess(user.id)))
    return { ok: "You already have full access." };

  const code = normalize(String(formData.get("code") ?? ""));
  if (!code) return { error: "Enter your access code." };

  const [row] = await db
    .select({ id: accessCodes.id, usedBy: accessCodes.usedByUserId })
    .from(accessCodes)
    .where(eq(accessCodes.code, code))
    .limit(1);

  if (!row) return { error: "That code isn’t valid. Check for typos." };
  if (row.usedBy) return { error: "That code has already been used." };

  // Claim the code only if still unused (guards against double-redeem races).
  const claimed = await db
    .update(accessCodes)
    .set({ usedByUserId: user.id, usedAt: new Date() })
    .where(and(eq(accessCodes.id, row.id), isNull(accessCodes.usedByUserId)))
    .returning({ id: accessCodes.id });

  if (claimed.length === 0)
    return { error: "That code was just used. Try another." };

  await grantAccessToUser(user.id);
  return { ok: "Unlocked! Taking you to your course…" };
}

/* ----------------------------- Admin ----------------------------- */

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Forbidden");
}

export type CodeAdminState =
  | { ok?: string; error?: string; codes?: string[] }
  | undefined;

/** Generate a batch of unused access codes. Returns the new codes so the admin
 * can copy them (e.g. to upload to Selar or hand to buyers). */
export async function generateCodes(
  _prev: CodeAdminState,
  formData: FormData,
): Promise<CodeAdminState> {
  await requireAdmin();
  const count = Math.min(
    Math.max(parseInt(String(formData.get("count") ?? "1"), 10) || 1, 1),
    200,
  );
  const note = String(formData.get("note") ?? "").trim() || null;

  const created: string[] = [];
  for (let i = 0; i < count; i++) {
    // Retry on the astronomically unlikely collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomCode();
      try {
        await db.insert(accessCodes).values({ code, note });
        created.push(code);
        break;
      } catch {
        if (attempt === 4) throw new Error("Could not generate codes.");
      }
    }
  }

  revalidatePath("/admin/codes");
  return { ok: `Generated ${created.length} code(s).`, codes: created };
}

/** Delete an unused code (revoke). Used codes are kept for the record. */
export async function revokeCode(
  _prev: CodeAdminState,
  formData: FormData,
): Promise<CodeAdminState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing code." };
  await db
    .delete(accessCodes)
    .where(and(eq(accessCodes.id, id), isNull(accessCodes.usedByUserId)));
  revalidatePath("/admin/codes");
  return { ok: "Code revoked." };
}

/** List codes for the admin table, newest first. */
export async function listCodes() {
  await requireAdmin();
  return db
    .select()
    .from(accessCodes)
    .orderBy(desc(accessCodes.createdAt))
    .limit(500);
}

"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";

export type ResetState = { ok?: string; error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_KEY = process.env.AUTH_RESEND_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "The Art of Money <onboarding@resend.dev>";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const idFor = (email: string) => `pwreset:${email.toLowerCase()}`;

async function baseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "learn.fryvstudio.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/** Request a password-reset link by email. Always returns a generic success
 * (no account enumeration). */
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  const generic: ResetState = {
    ok: "If an account exists for that email, a reset link is on its way.",
  };

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (!user) return generic;

  const raw = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, idFor(email)));
  await db.insert(verificationTokens).values({
    identifier: idFor(email),
    token: sha256(raw),
    expires,
  });

  const link = `${await baseUrl()}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n\n🔑  PASSWORD RESET for ${email}\n${link}\n\n`);
  }
  if (RESEND_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: "Reset your Art of Money password",
        html: `<div style="font-family:sans-serif;background:#151515;padding:32px;color:#c9c9c9">
          <p style="color:#14b8b8;font-size:12px;letter-spacing:2px;text-transform:uppercase">The Art of Money</p>
          <h1 style="color:#c9c9c9">Reset your password</h1>
          <p>Tap the button to choose a new password. This link works once and expires in 1 hour.</p>
          <a href="${link}" style="display:inline-block;background:#149490;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">Reset password →</a>
          <p style="color:#5c5c5c;font-size:12px;margin-top:24px">If you didn't request this, ignore it.</p>
        </div>`,
      }),
    }).catch(() => {});
  }

  return generic;
}

/** Complete a password reset with the token from the emailed link. */
export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords don't match." };
  if (!email || !token) return { error: "Invalid reset link." };

  const row = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.identifier, idFor(email)),
      eq(verificationTokens.token, sha256(token)),
      gt(verificationTokens.expires, new Date()),
    ),
  });
  if (!row) return { error: "This reset link is invalid or has expired." };

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(next, 10) })
    .where(eq(users.email, email));
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, idFor(email)));

  return { ok: "Password reset. You can sign in now." };
}

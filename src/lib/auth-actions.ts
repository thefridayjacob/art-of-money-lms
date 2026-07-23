"use server";

import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type AuthState = { error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign in with Google (OAuth). */
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/dashboard" });
}

/** Sign in with email + password. */
export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Wrong email or password." };
    }
    throw err; // re-throw the NEXT_REDIRECT on success
  }
}

/** Create an account with email + password, then sign in. */
export async function signUpWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    if (existing.passwordHash) {
      return { error: "An account with this email already exists. Sign in." };
    }
    // Existing user from Google/magic-link with no password — let them set one.
    await db
      .update(users)
      .set({
        passwordHash,
        name: existing.name ?? (name || null),
        displayName: existing.displayName ?? (name || null),
      })
      .where(eq(users.id, existing.id));
  } else {
    await db.insert(users).values({
      email,
      name: name || null,
      displayName: name || null,
      passwordHash,
      emailVerified: new Date(),
    });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try signing in." };
    }
    throw err;
  }
}

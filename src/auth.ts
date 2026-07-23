import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";
import { magicLinkEmail } from "@/lib/email-template";

const RESEND_KEY = process.env.AUTH_RESEND_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "The Art of Money <onboarding@resend.dev>";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  trustHost: true, // required on Netlify (non-Vercel host)
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  providers: [
    Resend({
      apiKey: RESEND_KEY ?? "dev-no-key",
      from: EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url }) {
        // Dev fallback: no Resend key yet → print the magic link to the
        // server log so we can test the whole flow without sending mail.
        if (!RESEND_KEY) {
          console.log(
            `\n\n🔑  MAGIC LINK for ${email}\n${url}\n(no AUTH_RESEND_KEY set — this link is logged for local testing)\n\n`,
          );
          return;
        }

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: email,
            subject: "Your link to The Art of Money",
            html: magicLinkEmail(url),
          }),
        });

        if (!res.ok) {
          throw new Error(`Resend error: ${res.status} ${await res.text()}`);
        }
      },
    }),
  ],
  callbacks: {
    // Expose id + isAdmin on the session (database-session strategy passes
    // the full adapter user row here).
    session({ session, user }) {
      if (session.user) {
        const dbIsAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        session.user.id = user.id;
        session.user.isAdmin =
          dbIsAdmin ||
          (!!process.env.ADMIN_EMAIL &&
            session.user.email?.toLowerCase() ===
              process.env.ADMIN_EMAIL.toLowerCase());
        session.user.displayName =
          (user as { displayName?: string | null }).displayName ?? null;
      }
      return session;
    },
  },
});

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ProfileForm, PasswordForm } from "@/components/account/AccountForms";

export const metadata = { title: "Settings · The Art of Money" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      email: true,
      name: true,
      displayName: true,
      marketingOptIn: true,
      passwordHash: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Settings
      </h1>
      <p className="prose-money mt-1 text-muted">
        Signed in as <span className="text-ink">{user.email}</span>
      </p>

      <div className="mt-6 space-y-4">
        <ProfileForm
          name={user.displayName || user.name || ""}
          marketingOptIn={user.marketingOptIn}
        />
        <PasswordForm hasPassword={!!user.passwordHash} />

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="pt-2"
        >
          <button
            type="submit"
            className="press rounded-2xl border border-border px-4 py-2.5 font-display text-sm font-semibold text-muted transition hover:border-ink/30 hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

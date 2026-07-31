import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasAccess } from "@/lib/access";
import { AppHeader } from "@/components/AppHeader";
import { MobileNav } from "@/components/MobileNav";
import { BadgeCelebrationProvider } from "@/components/interactive/BadgeCelebration";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Paywall: the whole course sits behind purchased (or admin-granted) access.
  if (!session.user.isAdmin && !(await userHasAccess(session.user.id))) {
    redirect("/unlock");
  }

  return (
    <BadgeCelebrationProvider>
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <AppHeader />
        {/* pb accounts for the fixed mobile tab bar */}
        <div className="flex-1 pb-20 sm:pb-0">{children}</div>
        <MobileNav />
      </div>
    </BadgeCelebrationProvider>
  );
}

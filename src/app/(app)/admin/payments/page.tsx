import Link from "next/link";
import { redirect } from "next/navigation";
import { CaretLeft, Bank } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { getPaymentSettings } from "@/lib/settings";
import { listClaims } from "@/lib/transfer-actions";
import {
  PaymentsAdmin,
  type ClaimRow,
} from "@/components/admin/PaymentsAdmin";

export const metadata = { title: "Payments · The Art of Money" };

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const [settings, rawClaims] = await Promise.all([
    getPaymentSettings(),
    listClaims(),
  ]);

  const claims: ClaimRow[] = rawClaims.map((c) => ({
    id: c.id,
    email: c.email,
    senderName: c.senderName,
    reference: c.reference,
    note: c.note,
    status: c.status,
    createdAt: fmt.format(c.createdAt),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 font-display text-xs font-semibold text-muted transition hover:text-ink"
      >
        <CaretLeft size={14} weight="bold" /> Content editor
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <Bank size={22} weight="duotone" className="text-teal" />
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Payments
        </h1>
      </div>
      <p className="prose-money mt-1 text-muted">
        Set your bank-transfer details and confirm transfers to unlock buyers.
      </p>

      <div className="mt-6">
        <PaymentsAdmin
          settings={{
            bankName: settings.bankName,
            accountNumber: settings.accountNumber,
            accountName: settings.accountName,
            priceNaira:
              settings.priceKobo > 0 ? String(settings.priceKobo / 100) : "",
            instructions: settings.instructions,
          }}
          claims={claims}
        />
      </div>
    </main>
  );
}

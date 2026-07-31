"use client";

import { useActionState } from "react";
import { LockKeyOpen } from "@phosphor-icons/react";
import { startCheckout, type CheckoutState } from "@/lib/checkout-actions";

export function PayButton({ priceLabel }: { priceLabel: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    async () => startCheckout(),
    undefined,
  );

  return (
    <form action={action} className="mt-6">
      <button
        type="submit"
        disabled={pending}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-teal px-6 py-4 font-display text-base font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright disabled:opacity-60"
      >
        <LockKeyOpen size={20} weight="bold" />
        {pending ? "Taking you to checkout…" : `Unlock the course · ${priceLabel}`}
      </button>
      {state?.error && (
        <p className="mt-3 text-center font-display text-sm text-pink">
          {state.error}
        </p>
      )}
      <p className="mt-3 text-center font-display text-xs text-chalk/40">
        Secure payment by Paystack · card &amp; bank transfer
      </p>
    </form>
  );
}

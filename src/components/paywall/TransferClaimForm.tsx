"use client";

import { useActionState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { submitTransferClaim, type TransferState } from "@/lib/transfer-actions";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-display text-sm text-chalk placeholder:text-chalk/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/40";

export function TransferClaimForm({ pending }: { pending: boolean }) {
  const [state, action, submitting] = useActionState<TransferState, FormData>(
    submitTransferClaim,
    undefined,
  );

  if (state?.ok || pending) {
    return (
      <div className="mt-4 rounded-2xl border border-teal/30 bg-teal/[0.06] px-4 py-3">
        <p className="font-display text-sm font-semibold text-teal-bright">
          Transfer submitted
        </p>
        <p className="prose-money mt-0.5 text-xs text-chalk/60">
          {state?.ok ??
            "Your transfer is awaiting confirmation. You’ll be let in as soon as it’s approved — check back shortly."}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-4 space-y-2.5">
      <input
        type="text"
        name="senderName"
        required
        placeholder="Name on the account you paid from"
        className={inputCls}
      />
      <input
        type="text"
        name="reference"
        placeholder="Transfer reference / narration (optional)"
        className={inputCls}
      />
      <input
        type="text"
        name="note"
        placeholder="Anything else (optional)"
        className={inputCls}
      />
      {state?.error && (
        <p className="font-display text-sm text-pink">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3.5 font-display font-semibold text-white transition hover:bg-teal-bright disabled:opacity-60"
      >
        <PaperPlaneTilt size={18} weight="bold" />
        {submitting ? "Submitting…" : "I’ve sent the transfer"}
      </button>
    </form>
  );
}

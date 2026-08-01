"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "@phosphor-icons/react";
import { redeemCode, type RedeemState } from "@/lib/code-actions";

export function RedeemForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<RedeemState, FormData>(
    redeemCode,
    undefined,
  );

  // On success the (app) layout will now see access — go straight in.
  useEffect(() => {
    if (state?.ok && state.ok.startsWith("Unlocked")) {
      const t = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <form action={action} className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          name="code"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="AOM-XXXX-XXXX"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-display uppercase tracking-wide text-chalk placeholder:normal-case placeholder:tracking-normal placeholder:text-chalk/30 outline-none focus:border-teal focus:ring-2 focus:ring-teal/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="press shrink-0 rounded-2xl bg-white/10 px-4 py-3 font-display text-sm font-semibold text-chalk transition hover:bg-white/15 disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-1.5">
            <Ticket size={16} weight="bold" />
            {pending ? "Checking…" : "Redeem"}
          </span>
        </button>
      </div>
      {state?.error && (
        <p className="mt-2 font-display text-sm text-pink">{state.error}</p>
      )}
      {state?.ok && (
        <p className="mt-2 font-display text-sm text-teal-bright">{state.ok}</p>
      )}
    </form>
  );
}

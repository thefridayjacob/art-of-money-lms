"use client";

import { useActionState } from "react";
import { Check, X, FloppyDisk } from "@phosphor-icons/react";
import {
  approveClaim,
  rejectClaim,
  savePaymentSettings,
  type TransferState,
} from "@/lib/transfer-actions";

export type SettingsProps = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  priceNaira: string;
  instructions: string;
};

export type ClaimRow = {
  id: string;
  email: string;
  senderName: string | null;
  reference: string | null;
  note: string | null;
  status: string;
  createdAt: string;
};

const field =
  "mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 font-display text-sm text-ink outline-none focus:border-teal";

export function PaymentsAdmin({
  settings,
  claims,
}: {
  settings: SettingsProps;
  claims: ClaimRow[];
}) {
  const [saveState, saveAction, saving] = useActionState<
    TransferState,
    FormData
  >(savePaymentSettings, undefined);

  const pending = claims.filter((c) => c.status === "pending");
  const past = claims.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-8">
      {/* Bank details settings */}
      <form action={saveAction} className="rounded-2xl border border-border bg-card p-4">
        <p className="font-display text-sm font-semibold text-ink">
          Bank transfer details
        </p>
        <p className="prose-money mt-0.5 text-xs text-muted">
          Shown to learners on the unlock page. Editable here — no redeploy.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="font-display text-xs font-semibold text-muted">
            Bank name
            <input name="bankName" defaultValue={settings.bankName} className={field} />
          </label>
          <label className="font-display text-xs font-semibold text-muted">
            Account number
            <input
              name="accountNumber"
              inputMode="numeric"
              defaultValue={settings.accountNumber}
              className={field}
            />
          </label>
          <label className="font-display text-xs font-semibold text-muted">
            Account name
            <input
              name="accountName"
              defaultValue={settings.accountName}
              className={field}
            />
          </label>
          <label className="font-display text-xs font-semibold text-muted">
            Price (₦)
            <input
              name="priceNaira"
              inputMode="decimal"
              placeholder="50000"
              defaultValue={settings.priceNaira}
              className={field}
            />
          </label>
        </div>
        <label className="mt-3 block font-display text-xs font-semibold text-muted">
          Instructions (optional)
          <textarea
            name="instructions"
            rows={2}
            defaultValue={settings.instructions}
            placeholder="e.g. Use your email as the transfer narration."
            className={field}
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="press inline-flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2 font-display text-sm font-semibold text-white transition hover:bg-teal-bright disabled:opacity-60"
          >
            <FloppyDisk size={15} weight="bold" />
            {saving ? "Saving…" : "Save details"}
          </button>
          {saveState?.ok && (
            <span className="font-display text-xs text-teal">{saveState.ok}</span>
          )}
          {saveState?.error && (
            <span className="font-display text-xs text-pink">{saveState.error}</span>
          )}
        </div>
      </form>

      {/* Pending claims */}
      <div>
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
          Transfers to confirm ({pending.length})
        </h2>
        <ul className="mt-3 space-y-2">
          {pending.map((c) => (
            <ClaimCard key={c.id} c={c} />
          ))}
        </ul>
        {pending.length === 0 && (
          <p className="mt-3 font-display text-sm text-muted">
            Nothing waiting. New transfer claims show up here.
          </p>
        )}
      </div>

      {/* History */}
      {past.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
            History
          </h2>
          <ul className="mt-3 space-y-2">
            {past.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm text-ink">
                    {c.email}
                  </p>
                  <p className="font-display text-xs text-muted">
                    {c.senderName ?? "—"} · {c.createdAt}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-display text-[11px] font-bold uppercase ${
                    c.status === "approved"
                      ? "bg-teal/10 text-teal"
                      : "bg-ink/5 text-muted"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ClaimCard({ c }: { c: ClaimRow }) {
  const [aState, approve, approving] = useActionState<TransferState, FormData>(
    approveClaim,
    undefined,
  );
  const [rState, reject, rejecting] = useActionState<TransferState, FormData>(
    rejectClaim,
    undefined,
  );
  const err = aState?.error || rState?.error;

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">
            {c.email}
          </p>
          <p className="mt-0.5 font-display text-xs text-muted">
            From <span className="text-ink">{c.senderName ?? "—"}</span>
            {c.reference ? ` · ref: ${c.reference}` : ""} · {c.createdAt}
          </p>
          {c.note && (
            <p className="prose-money mt-1 text-xs text-muted">“{c.note}”</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={approve}>
            <input type="hidden" name="id" value={c.id} />
            <button
              type="submit"
              disabled={approving}
              className="press inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1.5 font-display text-xs font-bold text-white transition hover:bg-teal-bright disabled:opacity-60"
            >
              <Check size={13} weight="bold" />
              {approving ? "…" : "Approve"}
            </button>
          </form>
          <form action={reject}>
            <input type="hidden" name="id" value={c.id} />
            <button
              type="submit"
              disabled={rejecting}
              className="press inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-display text-xs font-semibold text-muted transition hover:border-pink/50 hover:text-pink disabled:opacity-60"
            >
              <X size={13} weight="bold" />
              Reject
            </button>
          </form>
        </div>
      </div>
      {err && <p className="mt-2 font-display text-xs text-pink">{err}</p>}
    </li>
  );
}

"use client";

import { useActionState, useState } from "react";
import { Copy, Check, Trash, Ticket } from "@phosphor-icons/react";
import {
  generateCodes,
  revokeCode,
  type CodeAdminState,
} from "@/lib/code-actions";

export type CodeRow = {
  id: string;
  code: string;
  note: string | null;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
};

export function CodeManager({ codes }: { codes: CodeRow[] }) {
  const [genState, genAction, generating] = useActionState<
    CodeAdminState,
    FormData
  >(generateCodes, undefined);
  const [copied, setCopied] = useState(false);

  const fresh = genState?.codes ?? [];

  const copyAll = async () => {
    await navigator.clipboard.writeText(fresh.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const unused = codes.filter((c) => !c.used).length;

  return (
    <div>
      {/* Generate */}
      <form
        action={genAction}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <p className="font-display text-sm font-semibold text-ink">
          Generate access codes
        </p>
        <p className="prose-money mt-0.5 text-xs text-muted">
          Create codes to sell on Selar or hand out. Each unlocks one account.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="font-display text-xs font-semibold text-muted">
            How many
            <input
              type="number"
              name="count"
              min={1}
              max={200}
              defaultValue={10}
              className="mt-1 block w-24 rounded-xl border border-border bg-background px-3 py-2 font-display text-sm text-ink outline-none focus:border-teal"
            />
          </label>
          <label className="min-w-0 flex-1 font-display text-xs font-semibold text-muted">
            Note (optional)
            <input
              type="text"
              name="note"
              placeholder="e.g. Selar — August"
              className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 font-display text-sm text-ink outline-none focus:border-teal"
            />
          </label>
          <button
            type="submit"
            disabled={generating}
            className="press rounded-xl bg-teal px-4 py-2 font-display text-sm font-semibold text-white transition hover:bg-teal-bright disabled:opacity-60"
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {/* Freshly generated — copyable */}
      {fresh.length > 0 && (
        <div className="mt-3 rounded-2xl border border-teal/40 bg-teal/[0.05] p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-ink">
              {fresh.length} new code{fresh.length > 1 ? "s" : ""} — copy them now
            </p>
            <button
              type="button"
              onClick={copyAll}
              className="press inline-flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 font-display text-xs font-semibold text-white"
            >
              {copied ? <Check size={13} weight="bold" /> : <Copy size={13} weight="bold" />}
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-ink p-3 font-mono text-xs text-chalk">
            {fresh.join("\n")}
          </pre>
        </div>
      )}

      {/* Existing codes */}
      <div className="mt-6 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
          All codes
        </h2>
        <span className="font-display text-xs text-muted">
          {unused} unused · {codes.length} total
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {codes.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Ticket
                size={16}
                weight="bold"
                className={c.used ? "text-muted" : "text-teal"}
              />
              <span
                className={`font-mono text-sm ${
                  c.used ? "text-muted line-through" : "text-ink"
                }`}
              >
                {c.code}
              </span>
              {c.note && (
                <span className="truncate font-display text-xs text-muted">
                  · {c.note}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {c.used ? (
                <span className="rounded-full bg-ink/5 px-2 py-0.5 font-display text-[11px] font-semibold text-muted">
                  Used{c.usedAt ? ` · ${c.usedAt}` : ""}
                </span>
              ) : (
                <RevokeButton id={c.id} />
              )}
            </div>
          </li>
        ))}
      </ul>

      {codes.length === 0 && (
        <p className="mt-6 text-center font-display text-sm text-muted">
          No codes yet. Generate a batch above.
        </p>
      )}
    </div>
  );
}

function RevokeButton({ id }: { id: string }) {
  const [, action, pending] = useActionState<CodeAdminState, FormData>(
    revokeCode,
    undefined,
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title="Revoke (delete) this unused code"
        className="press inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 font-display text-xs font-semibold text-muted transition hover:border-pink/50 hover:text-pink disabled:opacity-40"
      >
        <Trash size={13} weight="bold" />
        Revoke
      </button>
    </form>
  );
}

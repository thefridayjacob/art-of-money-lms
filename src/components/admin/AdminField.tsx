"use client";

export function Field({
  label,
  name,
  defaultValue,
  textarea,
  rows = 3,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-xs font-semibold text-muted">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/25"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 font-display text-sm text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/25"
        />
      )}
    </label>
  );
}

export function SaveButton({
  pending,
  ok,
  error,
  label = "Save",
}: {
  pending: boolean;
  ok?: boolean;
  error?: string;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="press rounded-xl bg-teal px-4 py-2 font-display text-sm font-semibold text-white transition hover:bg-teal-bright disabled:opacity-60"
      >
        {pending ? "Saving…" : label}
      </button>
      {ok && (
        <span className="font-display text-xs font-semibold text-teal">
          Saved ✓
        </span>
      )}
      {error && (
        <span className="font-display text-xs font-semibold text-pink">
          {error}
        </span>
      )}
    </div>
  );
}

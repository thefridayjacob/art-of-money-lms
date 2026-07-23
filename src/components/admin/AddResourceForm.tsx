"use client";

import { useActionState, useEffect, useRef } from "react";
import { createResource, type AdminState } from "@/lib/admin-actions";
import { Field, SaveButton } from "./AdminField";

export function AddResourceForm({
  lessonId,
  lessonNumber,
}: {
  lessonId: string;
  lessonNumber: number;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    createResource,
    undefined,
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state?.ok]);

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-3 rounded-2xl border border-dashed border-teal/40 bg-teal/[0.03] p-4"
    >
      <p className="font-display text-sm font-bold text-ink">Add a resource</p>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="lessonNumber" value={lessonNumber} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[130px_1fr]">
        <label className="block">
          <span className="mb-1 block font-display text-xs font-semibold text-muted">
            Type
          </span>
          <select
            name="kind"
            defaultValue="watch"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-display text-sm text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/25"
          >
            <option value="watch">Watch (video)</option>
            <option value="read">Read (book)</option>
            <option value="article">Article</option>
          </select>
        </label>
        <Field label="Title" name="title" placeholder="e.g. New explainer video" />
      </div>
      <Field label="URL" name="url" type="url" placeholder="https://…" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Author" name="author" />
        <Field label="Note" name="note" />
      </div>
      <SaveButton pending={pending} ok={state?.ok} error={state?.error} label="Add resource" />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import {
  updateResource,
  deleteResource,
  type AdminState,
} from "@/lib/admin-actions";
import { Field, SaveButton } from "./AdminField";

type Resource = {
  id: string;
  kind: "watch" | "read" | "article";
  title: string;
  url: string | null;
  author: string | null;
  note: string | null;
};

const KINDS = [
  { value: "watch", label: "Watch (video)" },
  { value: "read", label: "Read (book)" },
  { value: "article", label: "Article" },
];

export function ResourceForm({
  resource,
  lessonNumber,
}: {
  resource: Resource;
  lessonNumber: number;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    updateResource,
    undefined,
  );

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <input type="hidden" name="resourceId" value={resource.id} />
      <input type="hidden" name="lessonNumber" value={lessonNumber} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[130px_1fr]">
        <label className="block">
          <span className="mb-1 block font-display text-xs font-semibold text-muted">
            Type
          </span>
          <select
            name="kind"
            defaultValue={resource.kind}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-display text-sm text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/25"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="Title" name="title" defaultValue={resource.title} />
      </div>

      <Field label="URL" name="url" defaultValue={resource.url} type="url" placeholder="https://…" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Author" name="author" defaultValue={resource.author} />
        <Field label="Note" name="note" defaultValue={resource.note} />
      </div>

      <div className="flex items-center justify-between">
        <SaveButton pending={pending} ok={state?.ok} error={state?.error} />
        <button
          type="submit"
          formAction={deleteResource}
          className="press rounded-xl border border-pink/40 px-3 py-2 font-display text-xs font-semibold text-pink transition hover:bg-pink/5"
        >
          Delete
        </button>
      </div>
    </form>
  );
}

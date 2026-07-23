"use client";

import { useActionState } from "react";
import { updateModel, type AdminState } from "@/lib/admin-actions";
import { Field, SaveButton } from "./AdminField";

export function ModelForm({
  model,
  lessonNumber,
}: {
  model: { id: string; number: number; title: string; body: string };
  lessonNumber: number;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    updateModel,
    undefined,
  );

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <input type="hidden" name="modelId" value={model.id} />
      <input type="hidden" name="lessonNumber" value={lessonNumber} />
      <p className="font-display text-xs font-bold text-muted">
        Model #{model.number}
      </p>
      <Field label="Title" name="title" defaultValue={model.title} />
      <Field label="Body (markdown)" name="body" defaultValue={model.body} textarea rows={5} />
      <SaveButton pending={pending} ok={state?.ok} error={state?.error} />
    </form>
  );
}

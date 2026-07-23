"use client";

import { useActionState } from "react";
import { updateLesson, type AdminState } from "@/lib/admin-actions";
import { Field, SaveButton } from "./AdminField";

type Lesson = {
  id: string;
  number: number;
  title: string;
  bigIdea: string | null;
  startHere: string | null;
  nigeriaCheck: string | null;
  homework: string | null;
  recap: string | null;
};

export function LessonForm({ lesson }: { lesson: Lesson }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    updateLesson,
    undefined,
  );

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <input type="hidden" name="lessonId" value={lesson.id} />
      <input type="hidden" name="lessonNumber" value={lesson.number} />
      <Field label="Title" name="title" defaultValue={lesson.title} />
      <Field label="Big Idea" name="bigIdea" defaultValue={lesson.bigIdea} textarea rows={2} />
      <Field label="Start here (markdown)" name="startHere" defaultValue={lesson.startHere} textarea rows={5} />
      <Field label="Nigeria Check (markdown)" name="nigeriaCheck" defaultValue={lesson.nigeriaCheck} textarea rows={5} />
      <Field label="Homework (markdown)" name="homework" defaultValue={lesson.homework} textarea rows={3} />
      <Field label="One-minute recap" name="recap" defaultValue={lesson.recap} textarea rows={2} />
      <SaveButton pending={pending} ok={state?.ok} error={state?.error} label="Save lesson" />
    </form>
  );
}

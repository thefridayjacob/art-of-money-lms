"use client";

import { useActionState } from "react";
import {
  updateProfile,
  changePassword,
  type AccountState,
} from "@/lib/account-actions";
import { Field, SaveButton } from "@/components/admin/AdminField";

export function ProfileForm({
  name,
  marketingOptIn,
}: {
  name: string;
  marketingOptIn: boolean;
}) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    updateProfile,
    undefined,
  );
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-base font-bold text-ink">Profile</h2>
      <Field label="Display name" name="name" defaultValue={name} />
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="marketing"
          defaultChecked={marketingOptIn}
          className="h-4 w-4 rounded border-border accent-[var(--color-teal)]"
        />
        <span className="font-display text-sm text-ink">
          Email me tips and new lessons
        </span>
      </label>
      <SaveButton
        pending={pending}
        ok={!!state?.ok}
        error={state?.error}
        label="Save profile"
      />
      {state?.ok && (
        <p className="font-display text-xs font-semibold text-teal">{state.ok}</p>
      )}
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    changePassword,
    undefined,
  );
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-display text-base font-bold text-ink">
          {hasPassword ? "Change password" : "Set a password"}
        </h2>
        {!hasPassword && (
          <p className="prose-money mt-1 text-sm text-muted">
            You sign in with Google. Set a password to also sign in with your
            email.
          </p>
        )}
      </div>
      {hasPassword && (
        <Field label="Current password" name="current" type="password" />
      )}
      <Field label="New password (min 8 characters)" name="next" type="password" />
      <Field label="Confirm new password" name="confirm" type="password" />
      <div className="flex items-center gap-3">
        <SaveButton
          pending={pending}
          ok={!!state?.ok}
          error={state?.error}
          label={hasPassword ? "Change password" : "Set password"}
        />
        {state?.ok && (
          <span className="font-display text-xs font-semibold text-teal">
            {state.ok}
          </span>
        )}
      </div>
    </form>
  );
}

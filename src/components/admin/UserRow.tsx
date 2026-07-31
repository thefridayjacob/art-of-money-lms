"use client";

import { useActionState, useState } from "react";
import {
  Trash,
  ShieldCheck,
  ShieldSlash,
  GoogleLogo,
  Key,
  Warning,
  LockKeyOpen,
  LockKey,
} from "@phosphor-icons/react";
import {
  deleteUser,
  setAdmin,
  setAccess,
  type UserAdminState,
} from "@/lib/user-admin-actions";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  isAdmin: boolean;
  hasAccess: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
  xp: number;
  streak: number;
  lastActive: string | null;
  joined: string;
};

export function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [delState, delAction, deleting] = useActionState<
    UserAdminState,
    FormData
  >(deleteUser, undefined);
  const [adminState, adminAction, savingAdmin] = useActionState<
    UserAdminState,
    FormData
  >(setAdmin, undefined);
  const [accessState, accessAction, savingAccess] = useActionState<
    UserAdminState,
    FormData
  >(setAccess, undefined);

  const name = user.displayName || user.name || "—";
  const error = delState?.error || adminState?.error || accessState?.error;

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-ink">
              {name}
            </span>
            {user.isAdmin && (
              <span className="rounded-full bg-teal/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-teal">
                Admin
              </span>
            )}
            {user.hasAccess && !user.isAdmin && (
              <span className="rounded-full bg-amber/15 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-amber-ink">
                Paid
              </span>
            )}
            {isSelf && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-muted">
                You
              </span>
            )}
          </div>
          <p className="truncate font-display text-xs text-muted">
            {user.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              {user.hasGoogle && <GoogleLogo size={12} weight="bold" />}
              {user.hasPassword && <Key size={12} weight="bold" />}
              {user.hasGoogle && user.hasPassword
                ? "Google + password"
                : user.hasGoogle
                  ? "Google"
                  : user.hasPassword
                    ? "Password"
                    : "No login set"}
            </span>
            <span>·</span>
            <span className="font-bold text-teal">{user.xp} XP</span>
            {user.streak > 0 && <span>· 🔥 {user.streak}</span>}
            <span>·</span>
            <span>
              {user.lastActive ? `Active ${user.lastActive}` : "Never active"}
            </span>
            <span>·</span>
            <span>Joined {user.joined}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {/* Grant / revoke course access */}
          {!user.isAdmin && (
            <form action={accessAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input
                type="hidden"
                name="grant"
                value={(!user.hasAccess).toString()}
              />
              <button
                type="submit"
                disabled={savingAccess}
                title={user.hasAccess ? "Revoke course access" : "Grant course access"}
                className={`press inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 font-display text-xs font-semibold transition disabled:opacity-40 ${
                  user.hasAccess
                    ? "border-border text-muted hover:border-ink/30 hover:text-ink"
                    : "border-amber/40 bg-amber/10 text-amber-ink hover:bg-amber/15"
                }`}
              >
                {user.hasAccess ? (
                  <LockKey size={14} weight="bold" />
                ) : (
                  <LockKeyOpen size={14} weight="bold" />
                )}
                {user.hasAccess ? "Revoke access" : "Grant access"}
              </button>
            </form>
          )}

          {/* Grant / revoke admin */}
          <form action={adminAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input
              type="hidden"
              name="makeAdmin"
              value={(!user.isAdmin).toString()}
            />
            <button
              type="submit"
              disabled={savingAdmin || isSelf}
              title={
                isSelf
                  ? "You can't change your own admin access here"
                  : user.isAdmin
                    ? "Remove admin"
                    : "Make admin"
              }
              className="press inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 font-display text-xs font-semibold text-muted transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {user.isAdmin ? (
                <ShieldSlash size={14} weight="bold" />
              ) : (
                <ShieldCheck size={14} weight="bold" />
              )}
              {user.isAdmin ? "Revoke" : "Make admin"}
            </button>
          </form>

          {/* Delete (two-step confirm) */}
          {!isSelf &&
            (confirming ? (
              <form action={delAction} className="flex items-center gap-1">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  disabled={deleting}
                  className="press inline-flex items-center gap-1 rounded-full bg-pink px-2.5 py-1.5 font-display text-xs font-bold text-white transition hover:brightness-95 disabled:opacity-60"
                >
                  <Warning size={14} weight="fill" />
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full px-2 py-1.5 font-display text-xs font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                title="Delete user"
                className="press inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 font-display text-xs font-semibold text-muted transition hover:border-pink/50 hover:text-pink"
              >
                <Trash size={14} weight="bold" />
                Delete
              </button>
            ))}
        </div>
      </div>

      {confirming && !deleting && (
        <p className="mt-2 font-display text-xs text-pink">
          This permanently deletes {user.email} and all their progress. This
          can’t be undone.
        </p>
      )}
      {error && <p className="mt-2 font-display text-xs text-pink">{error}</p>}
    </li>
  );
}

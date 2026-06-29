"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Account deletion, integrated into the page: a quiet "Delete account" link that
 * reveals the danger zone inline only when clicked. Confirming requires typing
 * DELETE, then it removes the user's Firestore data, deletes the Firebase Auth
 * account, clears local app data, and redirects. Client-side and scoped to the
 * current user — no admin/service-account credentials are involved.
 */
export default function DeleteAccountSection() {
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = acknowledged && !deleting;

  function reveal() {
    setOpen(true);
    setAcknowledged(false);
    setError(null);
  }

  function cancel() {
    if (deleting) return;
    setOpen(false);
    setAcknowledged(false);
    setError(null);
  }

  async function handleDelete() {
    if (!ready) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      router.replace("/signup");
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === "auth/requires-recent-login"
          ? "Please log out and log back in before deleting your account."
          : "Something went wrong while deleting your account. Please try again."
      );
      setDeleting(false);
    }
  }

  return (
    <section className="mt-10 border-t border-white/10 pt-6">
      {!open ? (
        <button
          type="button"
          onClick={reveal}
          className="text-sm font-medium text-slate-500 underline-offset-2 transition-colors hover:text-rose-300 hover:underline"
        >
          Delete account
        </button>
      ) : (
        <div className="danger-reveal rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5">
          <h3 className="font-serif text-lg font-bold text-rose-200">Danger zone</h3>
          <p className="mt-1 max-w-prose text-sm leading-6 text-rose-100/80">
            This permanently deletes your profile, lesson progress, and activity. This cannot be undone.
          </p>

          <label className="mt-4 flex items-start gap-2.5 text-sm leading-6 text-slate-200">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={deleting}
              className="mt-1 h-4 w-4 shrink-0 accent-rose-500 disabled:opacity-60"
            />
            <span>I understand this permanently deletes my account and all of my data.</span>
          </label>

          {error && (
            <p className="mt-3 max-w-prose rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={cancel}
              disabled={deleting}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!ready}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Permanently delete account"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

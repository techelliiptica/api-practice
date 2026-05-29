import React, { useEffect, useState } from "react";
import { apiWithRetry } from "../../utils/apiClient";
import { Skeleton } from "../../ui/common/Skeleton.jsx";
import { ErrorState } from "../../ui/common/ErrorState.jsx";

export function UserDetailsDrawer({ open, userId, onClose }) {
  const [state, setState] = useState({ status: "idle", user: null, error: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !userId) return;
      setState({ status: "loading", user: null, error: null });
      try {
        const res = await apiWithRetry.get(`/users/${userId}`);
        if (cancelled) return;
        setState({ status: "ready", user: res.data.data, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({ status: "error", user: null, error: err });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <div className="text-base font-semibold">User details</div>
            <div className="text-xs text-slate-500">Loaded via a separate API call (good for tests)</div>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose} data-testid="details-close">
            Close
          </button>
        </div>

        <div className="p-4">
          {state.status === "loading" ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : state.status === "error" ? (
            <ErrorState
              title="Failed to load details"
              message={state.error?.userMessage || "Please retry."}
              onRetry={() => {
                // Trigger re-fetch by resetting userId briefly.
                setState((s) => ({ ...s, status: "loading" }));
              }}
            />
          ) : state.user ? (
            <div className="space-y-3 text-sm">
              <div className="card p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</div>
                <div className="mt-1 font-semibold" data-testid="details-name">
                  {state.user.firstName} {state.user.lastName}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Info label="Email" value={state.user.email} testId="details-email" />
                <Info label="Phone" value={state.user.phone} testId="details-phone" />
                <Info label="Role" value={state.user.role} testId="details-role" />
                <Info label="Status" value={state.user.status} testId="details-status" />
              </div>

              <Info
                label="Created Date"
                value={new Date(state.user.createdAt).toLocaleString()}
                testId="details-createdAt"
              />

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <div className="font-semibold">Testing notes</div>
                <div className="mt-1">
                  Drawer rendering + separate API call are common real-world patterns and great for Playwright practice.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, testId }) {
  return (
    <div className="card p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-900" data-testid={testId}>
        {value}
      </div>
    </div>
  );
}


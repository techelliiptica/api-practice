import React from "react";

export function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md p-4">
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-2 text-sm text-slate-700">{message}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={busy}
            data-testid="confirm-cancel"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={busy}
            data-testid="confirm-ok"
          >
            {busy ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


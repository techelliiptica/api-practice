import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function nextId() {
  return crypto?.randomUUID?.() ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = nextId();
    const item = {
      id,
      title: toast.title || "",
      message: toast.message || "",
      variant: toast.variant || "info", // info | success | error | warning
      ttlMs: typeof toast.ttlMs === "number" ? toast.ttlMs : 3500
    };
    setToasts((prev) => [item, ...prev].slice(0, 5));
    window.setTimeout(() => remove(id), item.ttlMs);
    return id;
  }, [remove]);

  const value = useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          data-testid={`toast-${t.variant}`}
          className={[
            "card p-3 text-left",
            t.variant === "success" ? "border-emerald-200 bg-emerald-50" : "",
            t.variant === "error" ? "border-rose-200 bg-rose-50" : "",
            t.variant === "warning" ? "border-amber-200 bg-amber-50" : ""
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
              {t.message ? <div className="mt-0.5 text-sm text-slate-700">{t.message}</div> : null}
            </div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-white/60"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


import React from "react";

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
      <div className="text-base font-semibold text-rose-700">{title}</div>
      <div className="text-sm text-slate-600">{message}</div>
      {onRetry ? (
        <button type="button" className="btn-secondary mt-2" onClick={onRetry} data-testid="error-retry">
          Retry
        </button>
      ) : null}
    </div>
  );
}


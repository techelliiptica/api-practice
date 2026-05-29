import React from "react";

export function EmptyState({
  title = "Nothing here",
  message = "Try adjusting your filters or create a new record.",
  action
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm text-slate-600">{message}</div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}


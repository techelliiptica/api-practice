import React from "react";

export function Spinner({ size = 18, className = "" }) {
  return (
    <span
      className={[
        "inline-block animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600",
        className
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  );
}


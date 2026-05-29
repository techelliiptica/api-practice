import React from "react";

function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export function ProductCard({ product, isSelected, saving, disabled, onToggle }) {
  return (
    <article
      className={[
        "card flex flex-col p-4 transition",
        isSelected ? "border-indigo-300 ring-2 ring-indigo-100" : "hover:border-slate-300"
      ].join(" ")}
      data-testid={`product-card-${product.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{product.sku}</p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
            product.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
          ].join(" ")}
          data-testid={`product-status-${product.id}`}
        >
          {product.status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Category</span>
          <span className="font-medium text-slate-800">{product.category}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Price</span>
          <span className="font-semibold text-slate-900">{formatMoney(product.price)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Created</span>
          <span>{formatDate(product.createdAt)}</span>
        </div>
      </div>

      <p className="mt-2 truncate text-xs text-slate-400">ID: {product.id.slice(0, 8)}…</p>

      <button
        type="button"
        className={`mt-4 w-full ${isSelected ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onToggle(product.id)}
        disabled={disabled || saving}
        data-testid={`product-toggle-${product.id}`}
      >
        {saving ? "Saving…" : isSelected ? "Selected" : "Select product"}
      </button>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card p-4" data-testid="product-card-skeleton">
      <div className="flex justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="mt-4 h-10 w-full rounded-lg bg-slate-200 animate-pulse" />
    </div>
  );
}

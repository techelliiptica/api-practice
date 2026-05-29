import React, { useEffect, useMemo, useState } from "react";
import { productsApiWithRetry, apiWithRetry } from "../../utils/apiClient";
import { useToast } from "../../ui/toast/ToastContext.jsx";
import { Spinner } from "../../ui/common/Spinner.jsx";
import { EmptyState } from "../../ui/common/EmptyState.jsx";
import { ErrorState } from "../../ui/common/ErrorState.jsx";
import { ProductStatuses } from "./productTypes";
import { useDebounce } from "../users/useDebounce";
import { ProductCard, ProductCardSkeleton } from "./ProductCard.jsx";

const SORT_OPTIONS = [
  { value: "createdAt-desc", sortBy: "createdAt", sortDir: "desc", label: "Newest first" },
  { value: "createdAt-asc", sortBy: "createdAt", sortDir: "asc", label: "Oldest first" },
  { value: "name-asc", sortBy: "name", sortDir: "asc", label: "Name (A–Z)" },
  { value: "name-desc", sortBy: "name", sortDir: "desc", label: "Name (Z–A)" },
  { value: "price-asc", sortBy: "price", sortDir: "asc", label: "Price (low–high)" },
  { value: "price-desc", sortBy: "price", sortDir: "desc", label: "Price (high–low)" }
];

export function ProductsPage() {
  const { push } = useToast();

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [productsState, setProductsState] = useState({ status: "loading", data: null, error: null });
  const [selectedState, setSelectedState] = useState({ status: "loading", ids: new Set(), error: null });
  const [saving, setSaving] = useState(false);

  const sortValue = `${sortBy}-${sortDir}`;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    if (dq.trim()) params.set("q", dq.trim());
    if (status) params.set("status", status);
    return params.toString();
  }, [page, pageSize, sortBy, sortDir, dq, status]);

  async function loadSelected() {
    setSelectedState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const res = await apiWithRetry.get("/me/selected-products");
      const ids = new Set(res.data.data.productIds || []);
      setSelectedState({ status: "ready", ids, error: null });
    } catch (err) {
      setSelectedState({ status: "error", ids: new Set(), error: err });
    }
  }

  async function loadProducts() {
    setProductsState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const res = await productsApiWithRetry.get(`/products?${queryParams}`);
      setProductsState({ status: "ready", data: res.data.data, error: null });
    } catch (err) {
      setProductsState({ status: "error", data: null, error: err });
    }
  }

  useEffect(() => {
    loadSelected();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  useEffect(() => {
    setPage(1);
  }, [dq, status, pageSize, sortBy, sortDir]);

  const items = productsState.data?.items || [];
  const loading = productsState.status === "loading";
  const selectedCount = selectedState.ids.size;
  const selectDisabled = saving || selectedState.status !== "ready";

  async function saveSelected(nextIds) {
    setSaving(true);
    try {
      const res = await apiWithRetry.put("/me/selected-products", { productIds: Array.from(nextIds) });
      setSelectedState({ status: "ready", ids: new Set(res.data.data.productIds || []), error: null });
      push({ variant: "success", title: "Saved", message: "Selected products updated." });
    } catch (err) {
      push({ variant: "error", title: "Save failed", message: err.userMessage || "Please retry." });
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(productId) {
    if (selectedState.status !== "ready") return;
    const next = new Set(selectedState.ids);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    saveSelected(next);
  }

  function onSortChange(e) {
    const opt = SORT_OPTIONS.find((o) => o.value === e.target.value);
    if (opt) {
      setSortBy(opt.sortBy);
      setSortDir(opt.sortDir);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-2xl font-semibold">Products</div>
          <div className="mt-1 text-sm text-slate-600">
            Browse products as cards. Selection is saved in the Users API.
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={loadProducts}
          disabled={loading}
          data-testid="products-refresh"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="search-products">
              Search
            </label>
            <input
              id="search-products"
              className="input mt-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, SKU, category…"
              data-testid="products-search"
            />
          </div>

          <div>
            <label className="label" htmlFor="filter-product-status">
              Status
            </label>
            <select
              id="filter-product-status"
              className="select mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              data-testid="products-filter-status"
            >
              <option value="">All statuses</option>
              {ProductStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="products-sort">
              Sort by
            </label>
            <select
              id="products-sort"
              className="select mt-1"
              value={sortValue}
              onChange={onSortChange}
              data-testid="products-sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-slate-700">
              {productsState.data ? (
                <span data-testid="products-total">
                  {productsState.data.total} total • page {productsState.data.page} of {productsState.data.totalPages}
                </span>
              ) : (
                <span className="text-slate-500">Loading…</span>
              )}
            </div>

            <div
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              data-testid="products-selected-count"
            >
              Selected: {selectedCount}
            </div>

            {saving ? (
              <span className="inline-flex items-center gap-2 text-xs text-slate-600" data-testid="products-saving">
                <Spinner size={14} />
                Saving…
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Per page</span>
            <select
              className="select w-28"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              data-testid="products-page-size"
            >
              {[6, 12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {productsState.status === "error" ? (
        <ErrorState
          title="Failed to load products"
          message={productsState.error?.userMessage || "Please retry."}
          onRetry={loadProducts}
        />
      ) : items.length === 0 && productsState.status === "ready" ? (
        <EmptyState title="No products found" message="Try clearing filters." />
      ) : (
        <>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-testid="products-grid"
          >
            {loading
              ? Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)
              : items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isSelected={selectedState.ids.has(p.id)}
                    saving={saving}
                    disabled={selectDisabled}
                    onToggle={toggleSelect}
                  />
                ))}
          </div>

          <div className="card flex items-center justify-between gap-2 px-4 py-3">
            <button
              type="button"
              className="btn-secondary"
              disabled={loading || !productsState.data || productsState.data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              data-testid="products-prev"
            >
              Previous
            </button>

            <div className="text-sm text-slate-600">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size={16} />
                  Loading…
                </span>
              ) : (
                <span data-testid="products-page">
                  Page {productsState.data?.page || 1} / {productsState.data?.totalPages || 1}
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn-secondary"
              disabled={loading || !productsState.data || productsState.data.page >= productsState.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-testid="products-next"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { apiWithRetry } from "../../utils/apiClient";
import { useToast } from "../../ui/toast/ToastContext.jsx";
import { Spinner } from "../../ui/common/Spinner.jsx";
import { Skeleton } from "../../ui/common/Skeleton.jsx";
import { EmptyState } from "../../ui/common/EmptyState.jsx";
import { ErrorState } from "../../ui/common/ErrorState.jsx";
import { ConfirmDialog } from "../../ui/common/ConfirmDialog.jsx";
import { Roles, Statuses } from "./userTypes";
import { useDebounce } from "./useDebounce";
import { UserFormModal } from "./UserFormModal.jsx";
import { UserDetailsDrawer } from "./UserDetailsDrawer.jsx";

function defaultNewUser() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    status: "Active"
  };
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function UsersPage() {
  const { push } = useToast();

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);

  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [selected, setSelected] = useState(() => new Set());

  const [state, setState] = useState({ status: "loading", data: null, error: null });

  const [form, setForm] = useState({ open: false, mode: "create", values: defaultNewUser() });
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const [confirm, setConfirm] = useState({ open: false, mode: "single", ids: [], busy: false });
  const [details, setDetails] = useState({ open: false, userId: null });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    if (dq.trim()) params.set("q", dq.trim());
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    return params.toString();
  }, [page, pageSize, sortBy, sortDir, dq, role, status]);

  async function load() {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const res = await apiWithRetry.get(`/users?${queryParams}`);
      setState({ status: "ready", data: res.data.data, error: null });
      setSelected(new Set());
    } catch (err) {
      if (err?.response?.status === 401) {
        // Global predictable event for tests (and better UX).
        window.dispatchEvent(new CustomEvent("app:event", { detail: { type: "SESSION_EXPIRED" } }));
      }
      setState({ status: "error", data: null, error: err });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  useEffect(() => {
    // When search/filter changes, reset to page 1 to mimic typical enterprise UI behavior.
    setPage(1);
  }, [dq, role, status, pageSize, sortBy, sortDir]);

  const items = state.data?.items || [];

  const selectedCount = selected.size;
  const allVisibleSelected = items.length > 0 && items.every((u) => selected.has(u.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        items.forEach((u) => next.delete(u.id));
      } else {
        items.forEach((u) => next.add(u.id));
      }
      return next;
    });
  }

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreate() {
    setFormError("");
    setForm({ open: true, mode: "create", values: defaultNewUser() });
  }

  function openEdit(user) {
    setFormError("");
    setForm({
      open: true,
      mode: "edit",
      values: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  }

  async function submitForm(values) {
    setFormBusy(true);
    setFormError("");
    try {
      if (form.mode === "create") {
        await apiWithRetry.post("/users", values);
        push({ variant: "success", title: "User created", message: "New user added successfully." });
      } else {
        await apiWithRetry.put(`/users/${values.id}`, values);
        push({ variant: "success", title: "User updated", message: "Changes saved successfully." });
      }
      setForm({ open: false, mode: "create", values: defaultNewUser() });
      await load();
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === "DUPLICATE_EMAIL") {
        setFormError("That email already exists. Please use a different email.");
      } else {
        setFormError(err.userMessage || "Failed to save user.");
      }
      push({ variant: "error", title: "Save failed", message: err.userMessage || "Please retry." });
    } finally {
      setFormBusy(false);
    }
  }

  function askDeleteSingle(id) {
    setConfirm({ open: true, mode: "single", ids: [id], busy: false });
  }

  function askBulkDelete() {
    setConfirm({ open: true, mode: "bulk", ids: Array.from(selected), busy: false });
  }

  async function performDelete(ids) {
    setConfirm((c) => ({ ...c, busy: true }));
    try {
      if (ids.length === 1) await apiWithRetry.delete(`/users/${ids[0]}`);
      else await apiWithRetry.post("/users/bulk-delete", { ids });

      push({
        variant: "success",
        title: "Deleted",
        message: ids.length === 1 ? "User deleted." : `${ids.length} users deleted.`
      });
      setConfirm({ open: false, mode: "single", ids: [], busy: false });
      await load();
    } catch (err) {
      push({ variant: "error", title: "Delete failed", message: err.userMessage || "Please retry." });
      setConfirm((c) => ({ ...c, busy: false }));
    }
  }

  function openDetails(userId) {
    setDetails({ open: true, userId });
  }

  const tableLoading = state.status === "loading";

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-2xl font-semibold">Users</div>
          <div className="mt-1 text-sm text-slate-600">
            Search, filter, sort, paginate, bulk delete — built for UI automation practice.
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end md:w-auto">
          <button type="button" className="btn-secondary" onClick={load} disabled={tableLoading} data-testid="users-refresh">
            {tableLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="btn-primary" onClick={openCreate} data-testid="users-add">
            Add User
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="label" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="input mt-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, phone, role..."
              data-testid="users-search"
            />
            <div className="help">Debounced search (400ms) for realistic automation waits.</div>
          </div>

          <div>
            <label className="label" htmlFor="filter-role">
              Role
            </label>
            <select
              id="filter-role"
              className="select mt-1"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              data-testid="users-filter-role"
            >
              <option value="">All roles</option>
              {Roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="filter-status">
              Status
            </label>
            <select
              id="filter-status"
              className="select mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              data-testid="users-filter-status"
            >
              <option value="">All statuses</option>
              {Statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-slate-700">
              {state.data ? (
                <span data-testid="users-total">
                  {state.data.total} total • page {state.data.page} of {state.data.totalPages}
                </span>
              ) : (
                <span className="text-slate-500">Loading...</span>
              )}
            </div>

            {selectedCount > 0 ? (
              <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700" data-testid="users-selected-count">
                Selected: {selectedCount}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Page size</span>
              <select
                className="select w-28"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                data-testid="users-page-size"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn-danger"
              disabled={selectedCount === 0 || tableLoading}
              onClick={askBulkDelete}
              data-testid="users-bulk-delete"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      </div>

      {state.status === "error" ? (
        <ErrorState
          title="Failed to load users"
          message={state.error?.userMessage || "Please retry."}
          onRetry={load}
        />
      ) : items.length === 0 && state.status === "ready" ? (
        <EmptyState
          title="No users found"
          message="Try clearing filters or add a new user."
          action={
            <button type="button" className="btn-primary" onClick={openCreate} data-testid="users-empty-add">
              Add User
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" data-testid="users-table">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all visible users"
                      data-testid="users-select-all"
                    />
                  </th>
                  <SortableTh label="Name" sortKey="firstName" sortBy={sortBy} sortDir={sortDir} onSort={(k, d) => { setSortBy(k); setSortDir(d); }} />
                  <SortableTh label="Email" sortKey="email" sortBy={sortBy} sortDir={sortDir} onSort={(k, d) => { setSortBy(k); setSortDir(d); }} />
                  <SortableTh label="Role" sortKey="role" sortBy={sortBy} sortDir={sortDir} onSort={(k, d) => { setSortBy(k); setSortDir(d); }} />
                  <SortableTh label="Status" sortKey="status" sortBy={sortBy} sortDir={sortDir} onSort={(k, d) => { setSortBy(k); setSortDir(d); }} />
                  <SortableTh label="Created" sortKey="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={(k, d) => { setSortBy(k); setSortDir(d); }} />
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {tableLoading
                  ? Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                      <tr key={`sk-${i}`} data-testid="users-row-skeleton">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-56" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                      </tr>
                    ))
                  : items.map((u) => (
                      <tr key={u.id} data-testid={`user-row-${u.id}`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(u.id)}
                            onChange={() => toggleRow(u.id)}
                            aria-label={`Select user ${u.email}`}
                            data-testid={`user-select-${u.id}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{u.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{u.email}</div>
                          <div className="text-xs text-slate-500">ID: {u.id.slice(0, 8)}...</div>
                        </td>
                        <td className="px-4 py-3">{u.role}</td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "rounded-full px-2 py-1 text-xs font-semibold",
                              u.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            ].join(" ")}
                            data-testid={`user-status-${u.id}`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => openDetails(u.id)}
                              data-testid={`user-view-${u.id}`}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => openEdit(u)}
                              data-testid={`user-edit-${u.id}`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => askDeleteSingle(u.id)}
                              data-testid={`user-delete-${u.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              className="btn-secondary"
              disabled={tableLoading || !state.data || state.data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              data-testid="users-prev"
            >
              Previous
            </button>

            <div className="text-sm text-slate-600">
              {tableLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size={16} />
                  Loading...
                </span>
              ) : (
                <span data-testid="users-page">
                  Page {state.data?.page || 1} / {state.data?.totalPages || 1}
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn-secondary"
              disabled={tableLoading || !state.data || state.data.page >= state.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-testid="users-next"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <UserFormModal
        open={form.open}
        mode={form.mode}
        initialValues={form.values}
        busy={formBusy}
        serverError={formError}
        onClose={() => setForm({ open: false, mode: "create", values: defaultNewUser() })}
        onSubmit={submitForm}
      />

      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === "bulk" ? "Bulk delete users" : "Delete user"}
        message={
          confirm.mode === "bulk"
            ? `Are you sure you want to delete ${confirm.ids.length} users? This cannot be undone.`
            : "Are you sure you want to delete this user? This cannot be undone."
        }
        confirmText={confirm.mode === "bulk" ? "Delete users" : "Delete"}
        cancelText="Cancel"
        danger
        busy={confirm.busy}
        onCancel={() => setConfirm({ open: false, mode: "single", ids: [], busy: false })}
        onConfirm={() => performDelete(confirm.ids)}
      />

      <UserDetailsDrawer
        open={details.open}
        userId={details.userId}
        onClose={() => setDetails({ open: false, userId: null })}
      />
    </div>
  );
}

function SortableTh({ label, sortKey, sortBy, sortDir, onSort }) {
  const active = sortBy === sortKey;
  const direction = active ? sortDir : "none";
  const nextDir = !active ? "asc" : sortDir === "asc" ? "desc" : "asc";

  return (
    <th className="px-4 py-3">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-slate-700"
        onClick={() => onSort(sortKey, nextDir)}
        data-testid={`sort-${sortKey}`}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <span className="text-[10px]">{direction === "asc" ? "▲" : direction === "desc" ? "▼" : "↕"}</span>
      </button>
    </th>
  );
}


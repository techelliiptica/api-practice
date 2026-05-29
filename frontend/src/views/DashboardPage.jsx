import React, { useEffect, useState } from "react";
import { apiWithRetry } from "../utils/apiClient";
import { Skeleton } from "../ui/common/Skeleton.jsx";
import { ErrorState } from "../ui/common/ErrorState.jsx";

export function DashboardPage() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  async function load() {
    setState({ status: "loading", data: null, error: null });
    try {
      const res = await apiWithRetry.get("/users?page=1&pageSize=1");
      setState({
        status: "ready",
        data: { total: res.data.data.total, totalPages: res.data.data.totalPages },
        error: null
      });
    } catch (err) {
      setState({ status: "error", data: null, error: err });
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === "error") {
    return (
      <ErrorState
        title="Dashboard failed to load"
        message={state.error?.userMessage || "Please retry."}
        onRetry={load}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">Dashboard</div>
          <div className="mt-1 text-sm text-slate-600">Quick stats for your test runs.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total users</div>
          <div className="mt-2 text-2xl font-semibold" data-testid="stat-total-users">
            {state.status === "loading" ? <Skeleton className="h-7 w-24" /> : state.data.total}
          </div>
          <div className="help">Backed by a local JSON datastore.</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">API behaviors</div>
          <div className="mt-2 text-sm text-slate-700">
            Delay + random failures can be toggled on the backend.
          </div>
          <div className="help">Great for retry logic + flaky network practice.</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session</div>
          <div className="mt-2 text-sm text-slate-700">JWT expiry + simulated timeout available.</div>
          <div className="help">Practice auth redirects and 401 handling.</div>
        </div>
      </div>
    </div>
  );
}


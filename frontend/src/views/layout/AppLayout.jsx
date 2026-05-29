import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth/AuthContext.jsx";
import { useToast } from "../../ui/toast/ToastContext.jsx";
import { Footer } from "../../ui/common/Footer.jsx";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
          isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"
        ].join(" ")
      }
      data-testid={`nav-${label.toLowerCase()}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-40" />
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { push } = useToast();

  async function onLogout() {
    await logout();
    push({ variant: "success", title: "Logged out", message: "You have been signed out." });
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:block">
          <div className="border-b border-slate-200 p-4">
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">Learning User</div>
            <div className="mt-1 text-lg font-semibold">User Management</div>
          </div>

          <nav className="p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</div>
            <div className="mt-2 flex flex-col gap-1">
              <NavItem to="/" label="Dashboard" />
              <NavItem to="/users" label="Users" />
              <NavItem to="/products" label="Products" />
            </div>
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <div className="text-xs text-slate-500">Signed in as</div>
            <div className="mt-1 text-sm font-semibold">{user?.email || "admin"}</div>
            <button type="button" className="btn-secondary mt-3 w-full" onClick={onLogout} data-testid="logout">
              Logout
            </button>
            <div className="mt-4 text-xs text-slate-500">
              Created by <span className="font-medium text-slate-700">Vaibhav Singh</span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">Learning User Portal</div>
                <div className="truncate text-xs text-slate-500">Beginner-friendly UI + API practice app</div>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <button type="button" className="btn-secondary" onClick={onLogout} data-testid="logout-mobile">
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}


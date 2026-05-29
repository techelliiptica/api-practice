import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./state/auth/AuthContext.jsx";
import { useToast } from "./ui/toast/ToastContext.jsx";
import { LoginPage } from "./views/LoginPage.jsx";
import { AppLayout } from "./views/layout/AppLayout.jsx";
import { DashboardPage } from "./views/DashboardPage.jsx";
import { UsersPage } from "./views/users/UsersPage.jsx";
import { ProductsPage } from "./views/products/ProductsPage.jsx";

function RequireAuth({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card px-6 py-4 text-sm text-slate-700">Loading session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default function App() {
  const { push } = useToast();

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.type === "SESSION_EXPIRED") {
        push({ variant: "warning", title: "Session expired", message: "Please login again." });
      }
    };
    window.addEventListener("app:event", handler);
    return () => window.removeEventListener("app:event", handler);
  }, [push]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="products" element={<ProductsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

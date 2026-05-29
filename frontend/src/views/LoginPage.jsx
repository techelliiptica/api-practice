import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth/AuthContext.jsx";
import { useToast } from "../ui/toast/ToastContext.jsx";
import { Spinner } from "../ui/common/Spinner.jsx";
import { Footer } from "../ui/common/Footer.jsx";

function validate(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email";
  if (!values.password) errors.password = "Password is required";
  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const { login } = useAuth();
  const { push } = useToast();

  const [values, setValues] = useState({ email: "admin@acme.test", password: "admin123" });
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const hasErrors = Object.keys(errors).length > 0;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (hasErrors) return;

    setBusy(true);
    try {
      await login(values);
      push({ variant: "success", title: "Welcome back", message: "Logged in successfully." });
      navigate(from, { replace: true });
    } catch (err) {
      push({ variant: "error", title: "Login failed", message: err.userMessage || "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="mx-auto flex w-full flex-1 max-w-6xl items-center justify-center p-4">
        <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white md:flex">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider opacity-90">Learning User</div>
              <div className="mt-3 text-3xl font-semibold leading-tight">
                User Management
                <div className="text-base font-normal opacity-90">Practice UI + API testing locally</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              Includes intentional delays, random failures (toggle), disabled buttons during requests, and session timeout
              simulation.
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="text-xl font-semibold">Sign in</div>
            <div className="mt-1 text-sm text-slate-600">Use the sample admin credentials from the README.</div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} data-testid="login-form">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input mt-1"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="admin@acme.test"
                  autoComplete="username"
                  data-testid="login-email"
                />
                {touched.email && errors.email ? <div className="error-text">{errors.email}</div> : null}
              </div>

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input mt-1"
                  value={values.password}
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="admin123"
                  autoComplete="current-password"
                  data-testid="login-password"
                />
                {touched.password && errors.password ? <div className="error-text">{errors.password}</div> : null}
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={busy}
                data-testid="login-submit"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={16} className="border-white/40 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <div className="font-semibold">Testing notes</div>
                <ul className="mt-1 list-disc pl-4">
                  <li>Buttons disable during API calls</li>
                  <li>Toasts appear for success/error</li>
                  <li>Token expires (JWT) + optional request-count timeout</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


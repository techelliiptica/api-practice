import React, { useMemo, useState } from "react";
import { Roles, Statuses } from "./userTypes";
import { Spinner } from "../../ui/common/Spinner.jsx";

function validate(values) {
  const errors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  else if (values.firstName.trim().length < 2) errors.firstName = "First name must be at least 2 characters";

  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  else if (values.lastName.trim().length < 2) errors.lastName = "Last name must be at least 2 characters";

  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email";

  if (!values.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[0-9+\-() ]{7,20}$/.test(values.phone.trim())) errors.phone = "Enter a valid phone number";

  if (!values.role) errors.role = "Role is required";
  if (!values.status) errors.status = "Status is required";
  return errors;
}

export function UserFormModal({
  open,
  mode, // "create" | "edit"
  initialValues,
  busy,
  serverError,
  onClose,
  onSubmit
}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => validate(values), [values]);
  const hasErrors = Object.keys(errors).length > 0;

  if (!open) return null;

  function closeIfAllowed() {
    if (busy) return;
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true
    });
    if (hasErrors) return;
    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-2xl p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold">
              {mode === "edit" ? "Edit user" : "Add user"}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              All fields are validated for realistic test scenarios.
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={closeIfAllowed}
            disabled={busy}
            aria-label="Close modal"
            data-testid="user-form-close"
          >
            ✕
          </button>
        </div>

        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field
            id="firstName"
            label="First Name"
            value={values.firstName}
            onChange={(v) => setValues((s) => ({ ...s, firstName: v }))}
            onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
            error={touched.firstName ? errors.firstName : ""}
            testId="user-firstName"
          />
          <Field
            id="lastName"
            label="Last Name"
            value={values.lastName}
            onChange={(v) => setValues((s) => ({ ...s, lastName: v }))}
            onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
            error={touched.lastName ? errors.lastName : ""}
            testId="user-lastName"
          />
          <Field
            id="email"
            label="Email"
            value={values.email}
            onChange={(v) => setValues((s) => ({ ...s, email: v }))}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={touched.email ? errors.email : ""}
            testId="user-email"
          />
          <Field
            id="phone"
            label="Phone Number"
            value={values.phone}
            onChange={(v) => setValues((s) => ({ ...s, phone: v }))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={touched.phone ? errors.phone : ""}
            testId="user-phone"
          />

          <div>
            <label className="label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="select mt-1"
              value={values.role}
              onChange={(e) => setValues((s) => ({ ...s, role: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, role: true }))}
              disabled={busy}
              data-testid="user-role"
            >
              <option value="">Select a role</option>
              {Roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {touched.role && errors.role ? <div className="error-text">{errors.role}</div> : null}
          </div>

          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="select mt-1"
              value={values.status}
              onChange={(e) => setValues((s) => ({ ...s, status: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, status: true }))}
              disabled={busy}
              data-testid="user-status"
            >
              <option value="">Select status</option>
              {Statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {touched.status && errors.status ? <div className="error-text">{errors.status}</div> : null}
          </div>

          {serverError ? (
            <div className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {serverError}
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeIfAllowed}
              disabled={busy}
              data-testid="user-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={busy}
              data-testid="user-form-submit"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <Spinner size={16} className="border-white/40 border-t-white" />
                  Saving...
                </span>
              ) : mode === "edit" ? (
                "Save changes"
              ) : (
                "Create user"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, onBlur, error, testId }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        data-testid={testId}
      />
      {error ? <div className="error-text">{error}</div> : null}
    </div>
  );
}


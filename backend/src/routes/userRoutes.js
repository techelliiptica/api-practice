const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { createUserSchema, updateUserSchema, roles, statuses } = require("../validation/userSchemas");
const {
  listUsers,
  getUserById,
  emailExists,
  createUser,
  updateUser,
  deleteUser,
  bulkDelete
} = require("../store/dataStore");

const router = express.Router();

function parseIntSafe(v, defaultValue) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : defaultValue;
}

function toLower(v) {
  return String(v || "").toLowerCase();
}

function applySearch(users, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return users;
  return users.filter((u) => {
    const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.phone} ${u.role} ${u.status}`.toLowerCase();
    return hay.includes(query);
  });
}

function applyFilters(users, { role, status }) {
  let out = users;
  if (role && roles.includes(role)) out = out.filter((u) => u.role === role);
  if (status && statuses.includes(status)) out = out.filter((u) => u.status === status);
  return out;
}

function applySort(users, sortBy, sortDir) {
  const dir = toLower(sortDir) === "asc" ? 1 : -1;
  const allowed = new Set(["createdAt", "firstName", "lastName", "email", "role", "status"]);
  const key = allowed.has(sortBy) ? sortBy : "createdAt";

  return users.slice().sort((a, b) => {
    const av = String(a[key] ?? "");
    const bv = String(b[key] ?? "");
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

router.get("/", authRequired, (req, res) => {
  const page = Math.max(1, parseIntSafe(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(5, parseIntSafe(req.query.pageSize, 10)));

  const q = req.query.q || "";
  const role = req.query.role || "";
  const status = req.query.status || "";
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortDir = String(req.query.sortDir || "desc");

  const all = listUsers();
  const searched = applySearch(all, q);
  const filtered = applyFilters(searched, { role, status });
  const sorted = applySort(filtered, sortBy, sortDir);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  res.json({
    data: {
      items,
      page: safePage,
      pageSize,
      total,
      totalPages,
      sortBy,
      sortDir,
      q: String(q),
      filters: { role: role || "", status: status || "" }
    }
  });
});

router.get("/:id", authRequired, (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: { code: "USER_NOT_FOUND", message: "User not found" }
    });
  }
  res.json({ data: user });
});

router.post("/", authRequired, validateBody(createUserSchema), (req, res) => {
  if (emailExists(req.body.email)) {
    return res.status(409).json({
      error: { code: "DUPLICATE_EMAIL", message: "Email already exists" }
    });
  }
  const user = createUser(req.body);
  res.status(201).json({ data: user });
});

router.put("/:id", authRequired, validateBody(updateUserSchema), (req, res) => {
  const id = req.params.id;
  const existing = getUserById(id);
  if (!existing) {
    return res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
  }
  if (req.body.email && emailExists(req.body.email, id)) {
    return res.status(409).json({
      error: { code: "DUPLICATE_EMAIL", message: "Email already exists" }
    });
  }
  const updated = updateUser(id, req.body);
  res.json({ data: updated });
});

router.delete("/:id", authRequired, (req, res) => {
  const ok = deleteUser(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
  }
  res.json({ data: { ok: true } });
});

router.post("/bulk-delete", authRequired, (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const clean = ids.map(String).filter(Boolean);
  if (clean.length === 0) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "ids[] is required" }
    });
  }
  const removedCount = bulkDelete(clean);
  res.json({ data: { removedCount } });
});

module.exports = router;


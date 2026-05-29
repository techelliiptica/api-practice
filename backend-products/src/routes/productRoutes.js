const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { listProducts, getProductById } = require("../store/productStore");

const router = express.Router();

function parseIntSafe(v, defaultValue) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : defaultValue;
}

function toLower(v) {
  return String(v || "").toLowerCase();
}

function applySearch(items, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return items;
  return items.filter((p) => {
    const hay = `${p.name} ${p.sku} ${p.category} ${p.status}`.toLowerCase();
    return hay.includes(query);
  });
}

function applyFilters(items, { category, status }) {
  let out = items;
  if (category) out = out.filter((p) => p.category === category);
  if (status) out = out.filter((p) => p.status === status);
  return out;
}

function applySort(items, sortBy, sortDir) {
  const dir = toLower(sortDir) === "asc" ? 1 : -1;
  const allowed = new Set(["createdAt", "name", "price", "category", "status", "sku"]);
  const key = allowed.has(sortBy) ? sortBy : "createdAt";

  return items.slice().sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    const as = String(av ?? "");
    const bs = String(bv ?? "");
    if (as < bs) return -1 * dir;
    if (as > bs) return 1 * dir;
    return 0;
  });
}

router.get("/", authRequired, (req, res) => {
  const page = Math.max(1, parseIntSafe(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(5, parseIntSafe(req.query.pageSize, 10)));

  const q = req.query.q || "";
  const category = String(req.query.category || "");
  const status = String(req.query.status || "");
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortDir = String(req.query.sortDir || "desc");

  const all = listProducts();
  const searched = applySearch(all, q);
  const filtered = applyFilters(searched, { category, status });
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
      filters: { category: category || "", status: status || "" }
    }
  });
});

router.get("/:id", authRequired, (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({
      error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" }
    });
  }
  res.json({ data: product });
});

module.exports = router;


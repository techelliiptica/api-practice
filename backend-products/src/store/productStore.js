const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DB_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "products.json");

let db = {
  products: []
};

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function readDbFromDisk() {
  if (!fs.existsSync(DB_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function writeDbToDisk() {
  ensureDir(DB_DIR);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function seedProducts() {
  const categories = ["SaaS", "Security", "Analytics", "Payments", "DevTools"];
  const statuses = ["Active", "Inactive"];
  const products = [];

  for (let i = 1; i <= 42; i++) {
    const category = categories[i % categories.length];
    products.push({
      id: uuidv4(),
      name: `Product ${i}`,
      sku: `SKU-${String(i).padStart(4, "0")}`,
      price: Number((49 + i * 2.5).toFixed(2)),
      category,
      status: statuses[i % statuses.length],
      createdAt: nowIso()
    });
  }

  db.products = products;
  writeDbToDisk();
}

async function initProductStore() {
  const fromDisk = readDbFromDisk();
  if (fromDisk && Array.isArray(fromDisk.products)) {
    db = fromDisk;
    return;
  }

  const seed = String(process.env.SEED_ON_START || "true").toLowerCase() === "true";
  if (seed) seedProducts();
  else writeDbToDisk();
}

function listProducts() {
  return db.products.slice();
}

function getProductById(id) {
  return db.products.find((p) => p.id === id) || null;
}

module.exports = {
  initProductStore,
  listProducts,
  getProductById
};


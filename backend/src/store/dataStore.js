const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DB_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "db.json");

let db = {
  users: [],
  selectionsByUser: {}
};

function nowIso() {
  return new Date().toISOString();
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readDbFromDisk() {
  if (!fs.existsSync(DB_FILE)) return null;
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeDbToDisk() {
  ensureDir(DB_DIR);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function seedUsers() {
  const roles = ["Manager", "Support", "Engineer", "QA", "Analyst"];
  const statuses = ["Active", "Inactive"];
  const firstNames = ["Aarav", "Isha", "Kabir", "Meera", "Arjun", "Sana", "Rohan", "Nisha"];
  const lastNames = ["Sharma", "Patel", "Singh", "Khan", "Gupta", "Iyer", "Nair", "Das"];

  const users = [];
  for (let i = 1; i <= 37; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    users.push({
      id: uuidv4(), // dynamic IDs help UI tests avoid brittle assumptions
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.test`,
      phone: `9${String(100000000 + i).slice(0, 9)}`,
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      createdAt: nowIso()
    });
  }
  db.users = users;
  // For the admin demo account, store selections separately (keeps the users list clean).
  db.selectionsByUser = db.selectionsByUser || {};
  writeDbToDisk();
}

async function initDataStore() {
  const fromDisk = readDbFromDisk();
  if (fromDisk && Array.isArray(fromDisk.users)) {
    db = fromDisk;
    return;
  }

  const seed = String(process.env.SEED_ON_START || "true").toLowerCase() === "true";
  if (seed) seedUsers();
  else writeDbToDisk();
}

function listUsers() {
  return db.users.slice();
}

function getUserById(id) {
  return db.users.find((u) => u.id === id) || null;
}

function emailExists(email, excludeId) {
  const e = String(email || "").trim().toLowerCase();
  return db.users.some((u) => u.email.toLowerCase() === e && u.id !== excludeId);
}

function createUser(input) {
  const user = {
    id: uuidv4(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    role: input.role,
    status: input.status,
    createdAt: nowIso()
  };
  db.users.unshift(user);
  writeDbToDisk();
  return user;
}

function updateUser(id, patch) {
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const existing = db.users[idx];

  const updated = {
    ...existing,
    ...patch,
    email: patch.email ? patch.email.trim().toLowerCase() : existing.email
  };

  db.users[idx] = updated;
  writeDbToDisk();
  return updated;
}

function deleteUser(id) {
  const before = db.users.length;
  db.users = db.users.filter((u) => u.id !== id);
  const removed = before !== db.users.length;
  if (removed) writeDbToDisk();
  return removed;
}

function bulkDelete(ids) {
  const idSet = new Set(ids);
  const before = db.users.length;
  db.users = db.users.filter((u) => !idSet.has(u.id));
  const removedCount = before - db.users.length;
  if (removedCount > 0) writeDbToDisk();
  return removedCount;
}

function getSelectedProductIds(userId) {
  db.selectionsByUser = db.selectionsByUser || {};
  const list = db.selectionsByUser[userId];
  return Array.isArray(list) ? list : [];
}

function setSelectedProductIds(userId, productIds) {
  db.selectionsByUser = db.selectionsByUser || {};
  db.selectionsByUser[userId] = productIds;
  writeDbToDisk();
  return getSelectedProductIds(userId);
}

module.exports = {
  initDataStore,
  listUsers,
  getUserById,
  emailExists,
  createUser,
  updateUser,
  deleteUser,
  bulkDelete,
  getSelectedProductIds,
  setSelectedProductIds
};


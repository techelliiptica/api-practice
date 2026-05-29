/**
 * Copy this into your external Playwright project (not required inside this app).
 *
 * Usage:
 *   const { mockLearningUserApis } = require('../path/to/api-practice/playwright-mocks/mockRoutes.example.js');
 *   test.beforeEach(async ({ page }) => {
 *     await mockLearningUserApis(page);
 *   });
 */

const path = require("path");

const MOCKS_DIR = __dirname;

async function fulfillJson(route, fileName, status = 200) {
  const body = require(path.join(MOCKS_DIR, fileName));
  await route.fulfill({
    status,
    contentType: "application/json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-trace-id"
    },
    body: JSON.stringify(body)
  });
}

/**
 * Mock Users API (4000) + Products API (4001) for the Learning User app.
 * Register BEFORE page.goto().
 */
async function mockLearningUserApis(page, options = {}) {
  const { selectedProductsFile = "selected-products-empty.json" } = options;

  // --- Users API (port 4000) ---
  await page.route("**/localhost:4000/api/auth/login", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await fulfillJson(route, "auth-login.json");
  });

  await page.route("**/localhost:4000/api/auth/logout", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"data":{"ok":true}}' });
  });

  await page.route("**/localhost:4000/api/me/selected-products", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await fulfillJson(route, selectedProductsFile);
      return;
    }
    if (method === "PUT") {
      const payload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ data: { productIds: payload?.productIds || [] } })
      });
      return;
    }
    await route.continue();
  });

  // Optional: dashboard users count
  await page.route("**/localhost:4000/api/users?*", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        data: { items: [], page: 1, pageSize: 1, total: 37, totalPages: 37, sortBy: "createdAt", sortDir: "desc", q: "", filters: {} }
      })
    });
  });

  // --- Products API (port 4001) ---
  // IMPORTANT: match URL with query string (?page=1&pageSize=12&...)
  await page.route(/localhost:4001\/api\/products(\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await fulfillJson(route, "products-list.json");
  });
}

module.exports = { mockLearningUserApis, fulfillJson, MOCKS_DIR };

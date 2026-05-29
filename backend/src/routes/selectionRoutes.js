const express = require("express");
const { z } = require("zod");
const { authRequired } = require("../middlewares/auth");
const { getSelectedProductIds, setSelectedProductIds } = require("../store/dataStore");

const router = express.Router();

// For this practice app we use the authenticated subject as the "user id".
function currentUserId(req) {
  return String(req.user?.sub || "admin");
}

router.get("/me/selected-products", authRequired, (req, res) => {
  const ids = getSelectedProductIds(currentUserId(req));
  res.json({ data: { productIds: ids } });
});

const updateSchema = z.object({
  productIds: z.array(z.string().min(1)).max(200)
});

router.put("/me/selected-products", authRequired, (req, res) => {
  const parsed = updateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() }
    });
  }

  // De-dupe while preserving order (useful for predictable tests).
  const seen = new Set();
  const deduped = parsed.data.productIds.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const saved = setSelectedProductIds(currentUserId(req), deduped);
  res.json({ data: { productIds: saved } });
});

module.exports = router;


const express = require("express");
const { z } = require("zod");
const { authRequired } = require("../middlewares/auth");
const { getToggles, updateToggles } = require("../store/toggles");

const router = express.Router();

const toggleSchema = z.object({
  simulateDelayEnabled: z.boolean().optional(),
  delayMsMin: z.number().int().min(0).optional(),
  delayMsMax: z.number().int().min(0).optional(),
  randomFailuresEnabled: z.boolean().optional(),
  randomFailureRate: z.number().min(0).max(1).optional(),
  sessionTimeoutEnabled: z.boolean().optional(),
  sessionTimeoutMaxRequests: z.number().int().min(1).optional()
});

router.get("/toggles", authRequired, (req, res) => {
  res.json({ data: getToggles() });
});

router.put("/toggles", authRequired, (req, res) => {
  const parsed = toggleSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten()
      }
    });
  }

  const next = updateToggles(parsed.data);
  res.json({ data: next });
});

module.exports = router;


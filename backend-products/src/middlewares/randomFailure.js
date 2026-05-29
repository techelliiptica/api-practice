const { getToggles } = require("../store/toggles");

function randomFailure(req, res, next) {
  const t = getToggles();
  if (!t.randomFailuresEnabled) return next();

  const rate = Math.min(1, Math.max(0, Number(t.randomFailureRate || 0)));
  const roll = Math.random();

  if (roll < rate) {
    res.setHeader("x-random-failure", "1");
    return res.status(503).json({
      error: {
        code: "RANDOM_FAILURE",
        message: "Random failure enabled (simulated). Please retry."
      }
    });
  }

  next();
}

module.exports = { randomFailure };


// Runtime toggles (can be changed via /api/admin/toggles).
// These are intentionally stored in-memory to allow test automation to flip behavior without restarting.

function envBool(v, defaultValue) {
  if (v === undefined) return defaultValue;
  return String(v).toLowerCase() === "true";
}

function envNum(v, defaultValue) {
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultValue;
}

const toggles = {
  simulateDelayEnabled: envBool(process.env.SIMULATE_NETWORK_DELAY_ENABLED, true),
  delayMsMin: envNum(process.env.SIMULATE_NETWORK_DELAY_MS_MIN, 200),
  delayMsMax: envNum(process.env.SIMULATE_NETWORK_DELAY_MS_MAX, 1200),

  randomFailuresEnabled: envBool(process.env.RANDOM_FAILURES_ENABLED, false),
  randomFailureRate: envNum(process.env.RANDOM_FAILURE_RATE, 0.2),

  sessionTimeoutEnabled: envBool(process.env.SESSION_TIMEOUT_ENABLED, false),
  sessionTimeoutMaxRequests: envNum(process.env.SESSION_TIMEOUT_MAX_REQUESTS, 15)
};

function getToggles() {
  return { ...toggles };
}

function updateToggles(patch) {
  Object.assign(toggles, patch);
  return getToggles();
}

module.exports = { getToggles, updateToggles };


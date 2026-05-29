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
  randomFailureRate: envNum(process.env.RANDOM_FAILURE_RATE, 0.2)
};

function getToggles() {
  return { ...toggles };
}

function updateToggles(patch) {
  Object.assign(toggles, patch);
  return getToggles();
}

module.exports = { getToggles, updateToggles };


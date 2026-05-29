const { getToggles } = require("../store/toggles");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateDelay(req, res, next) {
  const t = getToggles();
  if (!t.simulateDelayEnabled) return next();

  const min = Math.max(0, Number(t.delayMsMin || 0));
  const max = Math.max(min, Number(t.delayMsMax || min));
  const wait = randomInt(min, max);

  res.setHeader("x-simulated-delay-ms", String(wait));
  await sleep(wait);
  next();
}

module.exports = { simulateDelay };


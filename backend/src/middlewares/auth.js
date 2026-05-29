const jwt = require("jsonwebtoken");
const { getToggles } = require("../store/toggles");

// Session timeout simulation: force token to "expire" after N authenticated requests (per token).
// Intentionally in-memory to keep setup simple.
const tokenRequestCounts = new Map();

function unauthorized(res, message, code = "UNAUTHORIZED") {
  return res.status(401).json({
    error: {
      code,
      message
    }
  });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return unauthorized(res, "Missing Authorization Bearer token");

  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);
    req.user = payload;

    const t = getToggles();
    if (t.sessionTimeoutEnabled) {
      const current = tokenRequestCounts.get(token) || 0;
      const nextCount = current + 1;
      tokenRequestCounts.set(token, nextCount);
      res.setHeader("x-session-req-count", String(nextCount));

      const max = Number(t.sessionTimeoutMaxRequests || 0);
      if (max > 0 && nextCount > max) {
        tokenRequestCounts.delete(token);
        return unauthorized(res, "Session timed out (simulated). Please login again.", "SESSION_TIMEOUT");
      }
    }

    next();
  } catch (err) {
    return unauthorized(res, "Invalid or expired token", "TOKEN_INVALID");
  }
}

module.exports = { authRequired };


const jwt = require("jsonwebtoken");

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
    next();
  } catch (err) {
    return unauthorized(res, "Invalid or expired token", "TOKEN_INVALID");
  }
}

module.exports = { authRequired };


// A tiny, beginner-friendly logger you can assert against in tests (request id, timing).
const { v4: uuidv4 } = require("uuid");

function requestLogger(req, res, next) {
  const requestId = uuidv4().slice(0, 8);
  req.requestId = requestId;

  const startedAt = Date.now();
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const ms = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });

  next();
}

module.exports = { requestLogger };


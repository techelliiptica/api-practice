const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { errorHandler, notFoundHandler } = require("./middlewares/errorHandlers");
const { requestLogger } = require("./middlewares/requestLogger");
const { simulateDelay } = require("./middlewares/simulateDelay");
const { randomFailure } = require("./middlewares/randomFailure");
const { initDataStore } = require("./store/dataStore");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const selectionRoutes = require("./routes/selectionRoutes");

async function start() {
  await initDataStore();

  const app = express();

  const port = Number(process.env.PORT || 4000);
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";

  function buildAllowedOrigins() {
    const set = new Set();
    [
      clientOrigin,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173"
    ].forEach((o) => set.add(o));
    return set;
  }

  const allowedOrigins = buildAllowedOrigins();

  app.use(
    cors({
      origin(origin, cb) {
        // Allow non-browser tools (curl, Postman) that don't send Origin.
        if (!origin) return cb(null, true);

        // In local dev, be permissive to avoid "localhost vs 127.0.0.1 vs LAN IP" pain.
        if (!isProd) return cb(null, true);

        if (allowedOrigins.has(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-client-trace-id"],
      exposedHeaders: ["x-request-id", "x-simulated-delay-ms", "x-random-failure", "x-session-req-count"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
  );

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(requestLogger);

  // Test-friendly behavior toggles
  app.use(simulateDelay);
  app.use(randomFailure);

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "backend", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api", selectionRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", err);
  process.exit(1);
});


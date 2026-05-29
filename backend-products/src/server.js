const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { errorHandler, notFoundHandler } = require("./middlewares/errorHandlers");
const { requestLogger } = require("./middlewares/requestLogger");
const { simulateDelay } = require("./middlewares/simulateDelay");
const { randomFailure } = require("./middlewares/randomFailure");
const { initProductStore } = require("./store/productStore");

const productRoutes = require("./routes/productRoutes");

async function start() {
  await initProductStore();

  const app = express();

  const port = Number(process.env.PORT || 4001);
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";

  const allowedOrigins = new Set([
    clientOrigin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
  ]);

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (!isProd) return cb(null, true);
        if (allowedOrigins.has(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-client-trace-id"],
      exposedHeaders: ["x-request-id", "x-simulated-delay-ms", "x-random-failure"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
  );

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(requestLogger);

  app.use(simulateDelay);
  app.use(randomFailure);

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "products", time: new Date().toISOString() });
  });

  app.use("/api/products", productRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Products API running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start products API:", err);
  process.exit(1);
});


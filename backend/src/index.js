import "./config/env.js";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import passport from "./config/passport.js";
import { csrfOriginGuard } from "./middleware/csrfOriginGuard.js";
import { csrfTokenGuard } from "./middleware/csrfTokenGuard.js";
import { httpMethodSafetyGuard } from "./middleware/httpMethodSafetyGuard.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import tutorRequestRoutes from "./routes/tutorRequestRoutes.js";
import tutorProfileRoutes from "./routes/tutorProfileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "../routes/notifications.js";
import contactRoutes from "./routes/contactRoutes.js";
import unifiedEmailService from "../notifications/services/unifiedEmailService.js";
import emailQueue from "../notifications/services/notificationQueue.js";

connectDB();

const app = express();
app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const expandOriginVariants = (origin) => {
  const trimmed = String(origin || "").trim();
  if (!trimmed) return [];

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (host === "localhost" || host === "127.0.0.1") {
      return [url.origin];
    }

    const withoutWww = host.replace(/^www\./, "");
    const withWww = host.startsWith("www.") ? host : `www.${host}`;

    return [
      `${url.protocol}//${withoutWww}${url.port ? `:${url.port}` : ""}`,
      `${url.protocol}//${withWww}${url.port ? `:${url.port}` : ""}`,
    ];
  } catch {
    return [trimmed];
  }
};

const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.APP_URL,
  process.env.CORS_ORIGINS,
  "http://localhost:5173",
]
  .filter(Boolean)
  .flatMap((entry) => entry.split(","))
  .flatMap((origin) => expandOriginVariants(origin))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set(configuredOrigins));

app.use(securityHeaders(allowedOrigins));
app.use(httpMethodSafetyGuard);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token", "X-CSRF-Token"],
  })
);

app.use(cookieParser());
const globalRateLimit = rateLimiter(
  Number(process.env.GLOBAL_RATE_LIMIT_MAX || 400),
  Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000)
);
const writeRateLimit = rateLimiter(
  Number(process.env.WRITE_RATE_LIMIT_MAX || 120),
  Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000)
);

app.use((req, res, next) => {
  if (req.path.startsWith("/health")) return next();
  if (req.method === "OPTIONS") return next();
  return globalRateLimit(req, res, next);
});

app.use((req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  if (req.path.startsWith("/health")) return next();
  return writeRateLimit(req, res, next);
});

app.use(csrfOriginGuard(allowedOrigins));
app.use(csrfTokenGuard);
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Server is running 24/7!");
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tutor-requests", tutorRequestRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api/contact", contactRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.head("/health", (req, res) => {
  res.status(200).end();
});

app.get("/health/deep", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1;
  const redisConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);
  const redisQueueEnabled = emailQueue?.isEnabled !== false;

  if (!dbConnected) {
    return res.status(503).json({
      status: "degraded",
      reason: "db_disconnected",
      dbConnected: false,
      redisConfigured,
      redisQueueEnabled,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
  } catch {
    return res.status(503).json({
      status: "degraded",
      reason: "db_ping_failed",
      dbConnected: false,
      redisConfigured,
      redisQueueEnabled,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: "ok",
    dbConnected: true,
    dbPingMs: Date.now() - start,
    redisConfigured,
    redisQueueEnabled,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/email", async (req, res) => {
  try {
    const brevoOk = await unifiedEmailService.verifyBrevoConnection();
    const redisConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);
    let redisOk = false;
    let queueStats = null;

    if (redisConfigured && emailQueue.isEnabled !== false) {
      try {
        await emailQueue.client.ping();
        redisOk = true;
        queueStats = {
          waiting: await emailQueue.getWaitingCount(),
          active: await emailQueue.getActiveCount(),
          failed: await emailQueue.getFailedCount(),
          delayed: await emailQueue.getDelayedCount(),
        };
      } catch {
        redisOk = false;
      }
    }

    res.status(200).json({
      brevoOk,
      redisConfigured,
      redisOk,
      queueStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      brevoOk: false,
      redisConfigured: Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT),
      redisOk: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `[startup] NODE_ENV=${process.env.NODE_ENV || "undefined"} REDIS_QUEUE_ENABLED=${emailQueue?.isEnabled !== false}`
  );
});

process.on("unhandledRejection", (reason) => {
  console.error("[runtime] Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[runtime] Uncaught exception:", err);
  setTimeout(() => process.exit(1), 1000);
});

process.on("SIGTERM", () => {
  console.log("[shutdown] SIGTERM received, closing HTTP server...");
  server.close(() => {
    console.log("[shutdown] HTTP server closed.");
    process.exit(0);
  });
});

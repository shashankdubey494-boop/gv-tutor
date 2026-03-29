import "./config/env.js";   // 🔥 MUST be FIRST import

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import passport from "./config/passport.js";
import { csrfOriginGuard } from "./middleware/csrfOriginGuard.js";
import { csrfTokenGuard } from "./middleware/csrfTokenGuard.js";
import { httpMethodSafetyGuard } from "./middleware/httpMethodSafetyGuard.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

connectDB();

const app = express();
app.set("trust proxy", 1);

// Security: Request body size limit (prevent DoS)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const expandOriginVariants = (origin) => {
  const trimmed = String(origin || "").trim();
  if (!trimmed) return [];

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    // Local/dev origins should not be transformed.
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
      // Allow server-to-server requests and health checks without an Origin header.
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

// Mount auth routes at both /auth and /api/auth (for Google OAuth compatibility)
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

// Import and mount other routes
import tutorRequestRoutes from "./routes/tutorRequestRoutes.js";
import tutorProfileRoutes from "./routes/tutorProfileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "../routes/notifications.js";
import contactRoutes from "./routes/contactRoutes.js";
import unifiedEmailService from "../notifications/services/unifiedEmailService.js";
import emailQueue from "../notifications/services/notificationQueue.js";

app.use("/api/tutor-requests", tutorRequestRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api/contact", contactRoutes);

// Health check endpoint (required for Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.head("/health", (req, res) => {
  res.status(200).end();
});

// Email/Notification health check (Brevo + Redis/queue)
app.get("/health/email", async (req, res) => {
  try {
    const brevoOk = await unifiedEmailService.verifyBrevoConnection();
    const redisConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT);
    let redisOk = false;
    let queueStats = null;

    if (redisConfigured) {
      try {
        await emailQueue.client.ping();
        redisOk = true;
        queueStats = {
          waiting: await emailQueue.getWaitingCount(),
          active: await emailQueue.getActiveCount(),
          failed: await emailQueue.getFailedCount(),
          delayed: await emailQueue.getDelayedCount(),
        };
      } catch (err) {
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

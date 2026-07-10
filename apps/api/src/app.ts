import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { healthRouter } from "./routes/health.route.js";
import { generateRouter } from "./routes/generate.route.js";
import { projectsRouter } from "./routes/projects.route.js";
import { authRouter } from "./routes/auth.route.js";
import { publicRouter } from "./routes/public.route.js";
import { usageRouter } from "./routes/usage.route.js";
import { billingRouter } from "./routes/billing.route.js";
import { analyticsRouter } from "./routes/analytics.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { webhookRouter } from "./routes/webhook.route.js";
import { workspacesRouter } from "./routes/workspaces.route.js";
import { invitationsRouter } from "./routes/invitations.route.js";
import { commentsRouter } from "./routes/comments.route.js";
import { notificationsRouter } from "./routes/notifications.route.js";
import { rateLimit } from "express-rate-limit";
// We don't import the strict `env` here for now since some tests mock process.env, 
// but we apply rate limiter.

import builderRoutes from "./routes/builder.route";
import aiBuilderRoutes from "./routes/ai-builder.route";
import pagesRoutes from "./routes/pages.route";
import navigationRoutes from "./routes/navigation.route";
import cmsRoutes from "./routes/cms.route";
import deploymentsRoutes from "./routes/deployments.route";
import domainsRoutes from "./routes/domains.route";
import projectAnalyticsRoutes from "./routes/project-analytics.route";
import environmentRoutes from "./routes/environment.route";

const app = express();

const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
  : [process.env.CLIENT_URL || "http://localhost:3000"];

const isOriginAllowed = (origin: string): boolean => {
  if (process.env.NODE_ENV === "development") return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/craftsite-ai-.*\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// Trust the first proxy hop (e.g. Render, Vercel, Cloudflare).
// This is required so express-rate-limit can safely read X-Forwarded-For.
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// IMPORTANT: Webhook route must be registered BEFORE express.json()
// so we can access the raw body Buffer for Razorpay signature verification.
app.use("/api/billing/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json({ limit: "2mb" }));

app.use("/api/projects/:projectId/builder", builderRoutes);
app.use("/api/projects/:projectId/builder", aiBuilderRoutes);
app.use("/api/projects/:projectId/pages", pagesRoutes);
app.use("/api/projects/:projectId/navigation", navigationRoutes);
app.use("/api/projects/:projectId/cms", cmsRoutes);
app.use("/api/projects/:projectId/deployments", deploymentsRoutes);
app.use("/api/projects/:projectId/domains", domainsRoutes);
app.use("/api/projects/:projectId/analytics", projectAnalyticsRoutes);
app.use("/api/projects/:projectId/environment", environmentRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "CraftSite AI API is running",
    status: "success",
    routes: ["/api/health", "/api/generate", "/api/projects", "/api/auth", "/api/public", "/api/usage", "/api/billing", "/api/analytics"],
  });
});

app.use("/api/health", healthRouter);
app.use("/api/generate", generateRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/comments", commentsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);
app.use("/api/usage", usageRouter);
app.use("/api/billing", billingRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/workspaces", workspacesRouter);
app.use("/api/workspace-invitations", invitationsRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

export { app };

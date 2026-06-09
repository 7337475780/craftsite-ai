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

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
  : [process.env.CLIENT_URL || "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
app.use(express.json({ limit: "2mb" }));

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
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);
app.use("/api/usage", usageRouter);
app.use("/api/billing", billingRouter);
app.use("/api/analytics", analyticsRouter);

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

app.listen(PORT, () => {
  console.log(`CraftSite API running on http://localhost:${PORT}`);
});

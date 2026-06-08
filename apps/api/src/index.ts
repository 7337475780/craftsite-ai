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

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
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
    routes: ["/api/health", "/api/generate", "/api/projects", "/api/auth"],
  });
});

app.use("/api/health", healthRouter);
app.use("/api/generate", generateRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/auth", authRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`CraftSite API running on http://localhost:${PORT}`);
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.route.js";
import { generateRouter } from "./routes/generate.route.js";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    message: "CraftSite AI API is running",
    status: "success",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/generate", generateRouter);

app.listen(PORT, () => {
  console.log(`CraftSite API running on http://localhost:${PORT}`);
});

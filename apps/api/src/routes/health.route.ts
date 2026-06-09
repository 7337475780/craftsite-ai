import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "CraftSite AI API",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

import "dotenv/config";
import { createServer } from "http";
import { app } from "./app.js";
import { initRealtimeServer } from "./realtime/socket-server.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);
initRealtimeServer(server);

server.listen(PORT, () => {
  console.log(`CraftSite API running on http://localhost:${PORT}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("Prisma disconnected successfully.");
      process.exit(0);
    } catch (err) {
      console.error("Error during Prisma disconnection:", err);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

import "dotenv/config";
import { createServer } from "http";
import { app } from "./app.js";
import { initRealtimeServer } from "./realtime/socket-server.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);
initRealtimeServer(server);

// Pre-warm the Prisma connection pool so the first request doesn't
// pay the cold-start cost of establishing a DB connection.
prisma.$connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`CraftSite API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

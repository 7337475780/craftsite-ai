import "dotenv/config";
import { createServer } from "http";
import { app } from "./app.js";
import { initRealtimeServer } from "./realtime/socket-server.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);
initRealtimeServer(server);

server.listen(PORT, () => {
  console.log(`CraftSite API running on http://localhost:${PORT}`);
});

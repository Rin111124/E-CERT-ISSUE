import app from "./app.js";
import { config } from "./config.js";
import { sequelize } from "./db.js";
import { initModels } from "./models/index.js";

async function start() {
  try {
    initModels();
    await sequelize.authenticate();
    console.log("Database connected");
    const server = app.listen(config.port, () => {
      console.log(`API listening on port ${config.port}`);
    });
    process.on("SIGINT", () => server.close());
  } catch (err) {
    console.error("Failed to start", err);
    process.exit(1);
  }
}

start();

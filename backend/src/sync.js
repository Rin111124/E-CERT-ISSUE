import { sequelize } from "./db.js";
import { initModels } from "./models/index.js";

async function main() {
  initModels();
  await sequelize.sync({ alter: true });
  console.log("Database synced");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

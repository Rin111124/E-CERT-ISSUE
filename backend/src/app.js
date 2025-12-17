import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { auth } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import issuerRoutes from "./routes/issuer.js";
import studentRoutes from "./routes/students.js";
import verifyRoutes from "./routes/verify.js";
import { createLogsRoutes } from "./routes/logs.js";

const app = express();
app.use(helmet());
const origins = (config.clientOrigin || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origins.includes("*") || origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/issuer", auth(true), issuerRoutes);
app.use("/api/students", auth(true), studentRoutes);
app.use("/api/verify", verifyRoutes);

// Logs route - can be created with database service injected
app.use("/api/logs", (req, res, next) => {
    // Placeholder - will be mounted by server.js with loggerService
    res.status(501).json({ error: "Logs service not configured" });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;

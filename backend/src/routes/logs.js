import express from "express";
import { auth as authenticate } from "../middleware/auth.js";

export function createLogsRoutes(loggerService) {
    const router = express.Router();

    // POST /logs - Create a log entry (called by frontend)
    router.post("/", async (req, res) => {
        try {
            const { level, action, message, metadata } = req.body;
            const actor = req.user?.email || "anonymous";

            await loggerService.log(level, action, message, actor, metadata);
            res.status(201).json({ success: true });
        } catch (err) {
            console.error("POST /logs error:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /logs - Fetch logs (admin only)
    router.get("/", authenticate, async (req, res) => {
        try {
            // Check admin role
            if (req.user?.role !== "SYS_ADMIN") {
                return res.status(403).json({ error: "Admin access required" });
            }

            const filters = {
                action: req.query.action,
                level: req.query.level,
                actor: req.query.actor,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                limit: req.query.limit ? parseInt(req.query.limit) : 100,
                offset: req.query.offset ? parseInt(req.query.offset) : 0,
            };

            const logs = await loggerService.getLogs(filters);
            res.json({ logs, count: logs.length });
        } catch (err) {
            console.error("GET /logs error:", err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}


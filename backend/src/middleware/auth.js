import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      if (required) return res.status(401).json({ message: "Missing token" });
      return next();
    }
    const token = header.replace("Bearer ", "");
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

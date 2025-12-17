import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { config } from "../config.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, fullName: user.fullName, ethAddress: user.ethAddress },
    config.jwtSecret,
    { expiresIn: "12h" }
  );
  res.json({ token, role: user.role, forcePasswordReset: user.forcePasswordReset });
});

// simple seed/register helper
router.post("/register", async (req, res) => {
  const { email, password, fullName, role, ethAddress } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, fullName, role, ethAddress });
  res.json({ id: user.id });
});

router.post("/change-password", auth(true), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters" });
  }
  const user = await User.findByPk(req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  const valid = await bcrypt.compare(currentPassword || "", user.password);
  if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed, forcePasswordReset: false });
  res.json({ message: "Password updated" });
});

export default router;

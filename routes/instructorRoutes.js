import express from "express";
import { verifyToken } from "../auth/tokenUtils.js";

const router = express.Router();

// Protected by JWT token
router.get("/", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.full_name}`, user: req.user });
});

export default router;

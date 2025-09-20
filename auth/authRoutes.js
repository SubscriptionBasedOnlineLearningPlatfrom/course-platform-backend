// only for testing- should be moved to routes folder
import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth route working " });
});

export default router;  

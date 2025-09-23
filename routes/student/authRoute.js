import { Router } from "express";
import { localAuth, requireJwt, googleAuthStart, googleAuth } from "../../middlewares/auth.js";
import {
  register,
  loginSuccess,
  googleCallback,
  dashboard,
  resetPassword,
  updatePassword,
} from "../../controllers/student/authController.js";

const authRouter = Router();

// Health/test (optional)
// authRouter.get("/test-supabase", async (req, res) => { ... });

// Register
authRouter.post("/register", register);

// Login (Local)
authRouter.post("/login", localAuth, loginSuccess);

// Google OAuth
authRouter.get("/google", googleAuthStart);
authRouter.get("/google/callback", googleAuth, googleCallback);

// Password reset
authRouter.post("/reset-password", resetPassword);
authRouter.post("/update-password", updatePassword);

// Protected sample
authRouter.get("/dashboard", requireJwt, dashboard);

export default authRouter;

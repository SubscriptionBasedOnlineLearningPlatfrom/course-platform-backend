import express from "express";
import { localAuth, requireJwt, googleAuthStart, googleAuth } from "../../middlewares/auth.js";
import {
  register,
  loginSuccess,
  googleCallback,
  dashboard,
  resetPassword,
  updatePassword,
} from "../../controllers/student/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", localAuth, loginSuccess);
authRouter.get("/google", googleAuthStart);
authRouter.get("/google/callback", googleAuth, googleCallback);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/update-password", updatePassword);
authRouter.get("/dashboard", requireJwt, dashboard);

export default authRouter;

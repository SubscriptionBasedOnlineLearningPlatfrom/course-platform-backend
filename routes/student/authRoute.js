import express from "express";
import { localAuth, requireJwt} from "../../middlewares/auth.js";
import {
  register,
  loginSuccess,
  dashboard,
  resetPassword,
  updatePassword,
} from "../../controllers/student/authController.js";
import { studentAuth } from "../../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", localAuth, loginSuccess);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/update-password",studentAuth, updatePassword);
authRouter.get("/dashboard", requireJwt, dashboard);

export default authRouter;

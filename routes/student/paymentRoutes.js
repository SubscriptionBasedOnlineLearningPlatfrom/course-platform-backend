import express from "express";
import { fetchStudentPlan } from "../../controllers/student/paymentController.js";
import { studentAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", studentAuth, fetchStudentPlan);

export default router;

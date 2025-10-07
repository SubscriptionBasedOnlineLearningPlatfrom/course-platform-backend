import express from "express";
import { getSubmissions, updateGrade } from "../../controllers/instructor/submissionController.js";
import { auth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

//get all submissions for the course
router.get("/:courseId", auth, getSubmissions);

//grade for a submission
router.patch("/:submissionId/grade", auth, updateGrade);

export default router;

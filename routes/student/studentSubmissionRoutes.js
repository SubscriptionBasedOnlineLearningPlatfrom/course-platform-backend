import express from "express";
import multer from "multer";
import { submitAssignment, getStudentSubmissions } from "../../controllers/student/studentAssignmentController.js";
import { studentAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer(); // memory storage for DO Space

//submit assignments
router.post("/:courseId/submit", studentAuth, upload.single("file"), submitAssignment);

//get all submitted assignments
router.get("/:courseId", studentAuth, getStudentSubmissions);

export default router;

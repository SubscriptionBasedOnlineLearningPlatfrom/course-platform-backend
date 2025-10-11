import express from "express";
import { getInstructorPerformance } from "../../controllers/admin/instructorPerformanceController.js";
import { getOverallData } from "../../controllers/admin/overallAnalyticsController.js";
import { getStudentActivity } from "../../controllers/admin/studentActivityController.js";

const router = express.Router();

//instructors' performance
router.get("/performance", getInstructorPerformance);

//overall analytics
router.get("/overall", getOverallData);

//student completion 
router.get("/student-activity", getStudentActivity);
export default router;

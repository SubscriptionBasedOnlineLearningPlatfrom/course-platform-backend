import express from 'express';
import { listModules } from '../../controllers/student/courseContentController.js';
import { trackProgress, updateModuleProgress, fetchCourseProgress } from '../../controllers/student/progressController.js'
import { studentAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

//get all modules 
router.get('/:courseId/content',studentAuth, listModules);

//initialize progress tracking
router.post("/track-progress", studentAuth, trackProgress);

//update module progress 
router.patch("/update-progress", studentAuth, updateModuleProgress);

//get progress for graphs
router.get("/:courseId/progress", studentAuth, fetchCourseProgress);

export default router;

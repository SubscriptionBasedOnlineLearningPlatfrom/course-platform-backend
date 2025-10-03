import express from 'express';
import { listModules } from '../../controllers/student/courseContentController.js';
import { trackProgress, updateModuleProgress } from '../../controllers/student/progressController.js'
import { studentAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Get all modules for a course
router.get('/:courseId/content',studentAuth, listModules);

// Initialize progress tracking
router.post("/track-progress", studentAuth, trackProgress);

// Update module progress 
router.patch("/update-progress", studentAuth, updateModuleProgress);

export default router;

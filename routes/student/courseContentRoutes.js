import express from 'express';
import { listModules } from '../../controllers/student/courseContentController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Get all modules for a course
/* router.get('/:courseId/content', auth, listModules); */
router.get('/:courseId/content', listModules);

export default router;

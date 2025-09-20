import express from 'express';
import { addModule, listModules, deleteModule } from '../../Controllers/Instructor/moduleController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Add a new module to a course
router.post('/:courseId', auth, addModule);

// Get all modules for a course
router.get('/:courseId', auth, listModules);

// delete module
router.delete('/:moduleId', auth, deleteModule);


export default router;

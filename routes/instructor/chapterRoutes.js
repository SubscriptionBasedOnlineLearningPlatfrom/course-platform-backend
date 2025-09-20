import express from 'express';
import { addChapter, deleteChapter } from '../../Controllers/Instructor/chapterController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Add a chap
router.post('/:moduleId', auth, addChapter);

//delete a chap(lesson==chapter)
router.delete('/:lessonId', auth, deleteChapter);

export default router;
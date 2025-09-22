import express from 'express';
import { addChapter, deleteChapter } from '../../Controllers/Instructor/chapterController.js';
import { auth } from '../../middlewares/authMiddleware.js';
import multer from "multer";
import {
  addVideoToLesson,
  addNoteToLesson,
  addAssignmentToLesson,
} from "../../Controllers/Instructor/lessonFileController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Add a chap
router.post('/:moduleId', auth, addChapter);

//delete a chap(lesson==chapter)
router.delete('/:lessonId', auth, deleteChapter);

// add resources to the lesson
router.post("/:lessonId/video", auth, upload.single("file"), addVideoToLesson);
router.post("/:lessonId/note", auth, upload.single("file"), addNoteToLesson);
router.post("/:lessonId/assignment", auth, upload.single("file"), addAssignmentToLesson);

export default router;
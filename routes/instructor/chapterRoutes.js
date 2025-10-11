import express from 'express';
import { addChapter, deleteChapter } from '../../controllers/instructor/chapterController.js';
import { auth } from '../../middlewares/authMiddleware.js';
import multer from "multer";
import {
  addVideoToLesson,
  addNoteToLesson,
  addAssignmentToLesson,
  deleteLessonResource,
} from "../../Controllers/Instructor/lessonFileController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//add a chapter
router.post('/:moduleId', auth, addChapter);

//delete a chapter
router.delete('/:lessonId', auth, deleteChapter);

//add resources to the lesson
router.post("/:lessonId/video", auth, upload.single("file"), addVideoToLesson);
router.post("/:lessonId/note", auth, upload.single("file"), addNoteToLesson);
router.post("/:lessonId/assignment", auth, upload.single("file"), addAssignmentToLesson);

//delete resource 
router.delete("/:lessonId/:type", auth, deleteLessonResource);

export default router;
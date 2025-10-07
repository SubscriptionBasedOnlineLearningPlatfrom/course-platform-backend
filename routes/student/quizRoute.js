import express from 'express';
import { loadQuiz } from '../../controllers/instructor/quizController.js';

const quizRouter = express.Router();

quizRouter.get('/:lessonId', loadQuiz);

export default quizRouter;
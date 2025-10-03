import express from 'express';
import { loadQuiz } from '../../controllers/instructor/quizController.js';

const quizRouter = express.Router();

quizRouter.get('/f1dcb0c9-17de-4fe8-8ccf-c5e973faa444', loadQuiz);

export default quizRouter;
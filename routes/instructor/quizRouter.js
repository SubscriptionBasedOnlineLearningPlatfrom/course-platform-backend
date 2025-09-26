import express from 'express';
import { loadQuiz, quizCreation } from '../../controllers/instructor/quizController.js';

const QuizRouter = express.Router();

QuizRouter.post('/create', quizCreation);
QuizRouter.get('/f1dcb0c9-17de-4fe8-8ccf-c5e973faa444', loadQuiz);

export default QuizRouter;
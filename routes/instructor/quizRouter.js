import express from 'express';
import { editQuiz, loadQuiz, quizCreation } from '../../controllers/instructor/quizController.js';

const QuizRouter = express.Router();

QuizRouter.post('/create/:lessonId', quizCreation);
QuizRouter.put('/edit/:quizId', editQuiz);
QuizRouter.get('/:lessonId', loadQuiz);

export default QuizRouter;
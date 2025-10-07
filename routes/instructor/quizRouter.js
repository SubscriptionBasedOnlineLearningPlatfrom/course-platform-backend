import express from 'express';
import { deleteAns, deleteQues, editQuiz, loadQuiz, quizCreation } from '../../controllers/instructor/quizController.js';

const QuizRouter = express.Router();

QuizRouter.post('/create/:lessonId', quizCreation);
QuizRouter.put('/edit/:quizId', editQuiz);
QuizRouter.get('/:lessonId', loadQuiz);
QuizRouter.delete('/delete-question/:questionId', deleteQues);
QuizRouter.delete('/delete-answer/:answerId', deleteAns);

export default QuizRouter;
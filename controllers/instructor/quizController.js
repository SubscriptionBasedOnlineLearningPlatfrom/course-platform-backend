import { z } from "zod"
import { supabase } from "../../config/supabaseClient.js";
import { deleteAnswer, deleteQuestion, editQuizModel, loadQuizModel, quizCreationModel } from "../../models/instructor/quizModel.js";

const NormalizedQuestion = z.object({
  question_text: z.string().min(1),
  answers: z.array(
    z.object({
      answer_text: z.string().min(1),
      is_correct: z.boolean(),
    })
  ).min(2),
});

export const QuizSchema = z.object({
  quiz_title: z.string().min(1),
  questions: z.array(NormalizedQuestion).min(1),
});

// create quiz for lessons
export const quizCreation = async (req, res) => {
  try {
    const lessionId = req.params.lessonId;
    const parsed = QuizSchema.safeParse(req.body);

    console.log(lessionId)

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const {  quiz_title, questions } = parsed.data;
    const data = await quizCreationModel(lessionId, quiz_title, questions);
    return res.status(201).json({ quiz_id: data });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error : ", details: error.message });
  }
}

// fetch all quizes by lession id
export const loadQuiz = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const full = await loadQuizModel(lessonId);
    
    return res.json(full);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error : ", details: error.message });
  }
}


export const editQuiz = async (req, res) => {
  const {quizId} = req.params;
  const { quiz_title, questions } = req.body;

  if (!quizId || !quiz_title || !questions) {
    return res.status(400).json({ error: "quizId, quiz_title, and questions are required" });
  }

  try {
    // call the PostgreSQL function
    const data = editQuizModel(quizId,quiz_title,questions);

    return res.json({ message: "Quiz updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export const deleteQues = async (req,res) => {
  const questionId = req.params.questionId;
  try {
    const data = await deleteQuestion(questionId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteAns = async (req,res) => {
  const answerId = req.params.answerId;
  console.log(answerId)
  try {
    const data = deleteAnswer(answerId);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: err.message });
  }
}

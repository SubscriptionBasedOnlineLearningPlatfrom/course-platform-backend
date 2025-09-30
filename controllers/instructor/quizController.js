import { z } from "zod"
import { supabase } from "../../config/supabaseClient.js";
import { loadQuizModel, quizCreationModel } from "../../models/instructor/quizModel.js";

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
  lesson_id: z.string().uuid(),
  quiz_title: z.string().min(1),
  questions: z.array(NormalizedQuestion).min(1),
});

// create quiz for lessons
export const quizCreation = async (req, res) => {
  try {
    const parsed = QuizSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const { lesson_id, quiz_title, questions } = parsed.data;
    const data = await quizCreationModel(lesson_id, quiz_title, questions);
    return res.status(201).json({ quiz_id: data });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error : ", details: error.message });
  }
}

// fetch all quizes by lession id
export const loadQuiz = async (req, res) => {
  try {
    const lesson_id = '950c15e3-5679-4b2d-b40a-b8d3d6eea77f' //req.params;
    const full = await loadQuizModel(lesson_id);
    return res.json(full);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error : ", details: error.message });
  }
}
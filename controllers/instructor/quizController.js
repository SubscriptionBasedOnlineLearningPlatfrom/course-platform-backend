import {z} from "zod"
import { supabase } from "../../config/supabaseClient.js";
import { quizCreationModel } from "../../models/instructor/quizModel.js";

// const SimpleQuestion = z.object({
//   question: z.string().min(1),
//   answers: z.array(z.string().min(1)).min(2),
//   correctAnswer: z.number().int().nonnegative(),
// });

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


export const quizCreation = async (req, res) => {
    try {
        const parsed = QuizSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const { lesson_id, quiz_title, questions } = parsed.data;

        const data = quizCreationModel(lesson_id, quiz_title, questions);

        return res.status(201).json({ quiz_id: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Internal Server Error : ",details:error.message});
    }
}

export const loadQuiz = async (req,res) => {
    try {
        const {lesson_id} = 'f1dcb0c9-17de-4fe8-8ccf-c5e973faa444' //req.params;
        const full = loadQuizModel(lesson_id);
        
        return res.json(full);

    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Internal Server Error : ",details:error.message});
    }
}
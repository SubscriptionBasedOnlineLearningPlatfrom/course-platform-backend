import {z} from "zod"
import { supabase } from "../../config/supabaseClient.js";

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

        console.log(parsed)

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const { lesson_id, quiz_title, questions } = parsed.data;

        const { data, error } = await supabase.rpc('create_quiz_with_q_a', {
            lesson_id: lesson_id,
            quiz_title: quiz_title,
            questions: questions
        })

        console.log(data);

        if (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({ quiz_id: data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Internal Server Error : ",details:error.message});
    }
}

export const loadQuiz = async (req,res) => {
    try {
        const {data:quiz, error:quizError} = await supabase
                                                    .from('quizzes')
                                                    .select('quiz_id, quiz_title')
                                                    .eq('lesson_id','f1dcb0c9-17de-4fe8-8ccf-c5e973faa444'); //req.params.lessonId
        
        if(quizError){
            return res.status(500).json({ error: quizError.message });
        }
        

        const {data:questions, error:questionsError} = await supabase
                                                            .from('questions')
                                                            .select('question_id, question_text')
                                                            .eq('quiz_id',quiz[0].quiz_id)
                                                            .order('created_at', {ascending:true});

        if(questionsError){
            return res.status(500).json({ error: questionsError.message });
        }

        const questionsIds = questions.map(q => q.question_id);
        const {data:answers, error:answersError} = await supabase
                                                         .from('answers')
                                                         .select('answer_id,question_id,answer_text,is_correct')
                                                         .in('question_id',questionsIds);

        if(answersError){
            return res.status(500).json({ error : answersError});
        }

        const full = questions.map(q => ({
            question:q.question_text,
            answers:(answers || []).filter(ans => ans.question_id === q.question_id).map(a => a.answer_text),
            correctAnswer: (answers || []).filter(a => a.question_id === q.question_id).findIndex(a => a.is_correct)
        }))
        
        return res.json(full);

    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Internal Server Error : ",details:error.message});
    }
}
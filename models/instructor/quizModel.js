import { supabase } from "../../config/supabaseClient.js";

export const quizCreationModel = async (lesson_id, quiz_title, questions) => {
    const { data, error } = await supabase.rpc('create_quiz_with_q_a', {
        lesson_id: lesson_id,
        quiz_title: quiz_title,
        questions: questions
    })
    
    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const editQuizModel = async (quizId,quiz_title,questions) => {
    const { data, error } = await supabase.rpc("modify_quiz", {
      p_quiz_id: quizId,
      p_quiz_title: quiz_title,
      p_questions: questions,
    });

    if (error){
        throw new Error(quizError.message);
    }
    return data;
}

export const loadQuizModel = async (lessonId) => {
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('quiz_id, quiz_title')
        .eq('lesson_id', lessonId);    

    if (quizError) {
        throw new Error(quizError.message);
    }
    


    const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('question_id, question_text')
        .eq('quiz_id', quiz[0].quiz_id)
        .order('created_at', { ascending: true });

    if (questionsError) {
        throw new Error(questionsError.message);
    }

    const questionsIds = questions.map(q => q.question_id);
    const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('answer_id,question_id,answer_text,is_correct')
        .in('question_id', questionsIds);

    if (answersError) {
        throw new Error(answersError.message);
    }

    const full = questions.map(q => ({
        question_id:q.question_id,
        question: q.question_text,
        answers: (answers || []).filter(ans => ans.question_id === q.question_id).map(a => ({answer_id: a.answer_id,answer_text:a.answer_text})),
        correctAnswer: (answers || []).filter(a => a.question_id === q.question_id).findIndex(a => a.is_correct)
    }))

    return {quiz,full};
}

export const deleteQuestion = async (question_id) => {
    const {data, error} = await supabase
                                .from('questions')
                                .delete()
                                .eq('question_id', question_id)
                                .select();
    if(error){
        throw new Error(error.message);
    }

    const {data:answer, error:answerError} = await supabase
                                .from('answers')
                                .delete()
                                .eq('question_id', question_id)
                                .select();
    if(answerError){
        throw new Error(answerError.message);
    }
    return data;

}

export const deleteAnswer = async (answer_id) => {
    const {data, error} = await supabase
                                .from('answers')
                                .delete()
                                .eq('answer_id', answer_id)
                                .select();

    if(error){
        throw new Error(error.message);
    }
    return data;
}
create or replace function public.create_quiz_with_q_a(
  lesson_id uuid,
  quiz_title text,
  questions jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_quiz_id uuid;
  v_question_id uuid;
  ques jsonb;
  ans jsonb;
begin
  insert into public.quizzes (lesson_id, quiz_title, passing_score)
  values (lesson_id, quiz_title, 100)
  returning quiz_id into v_quiz_id;

  -- each ques is: { "question_text": "...", "answers": [ { "answer_text": "...", "is_correct": true }, ... ] }
  for ques in
    select * from jsonb_array_elements(questions)
  loop
    insert into public.questions (quiz_id, question_text, question_type)
    values (v_quiz_id, ques->>'question_text', 'MCQ')
    returning question_id into v_question_id;

    -- loop answers as objects
    for ans in
      select * from jsonb_array_elements(ques->'answers')
    loop
      insert into public.answers (question_id, answer_text, is_correct)
      values (
        v_question_id,
        ans->>'answer_text',
        coalesce((ans->>'is_correct')::boolean, false)
      );
    end loop;
  end loop;

  return v_quiz_id;
end;
$$;


select * from lessons;

select public.create_quiz_with_q_a(
  'f74aadce-e083-46ea-a0c3-3839f43347d4', 
  'Sample Quiz',                          
  '[
     { "question": "What is 2+2?", "answers": ["3","4","5"], "correctAnswer": 1 },
     { "question": "Capital of France?", "answers": ["Paris","Rome"], "correctAnswer": 0 }
   ]'::jsonb
);

select * from answers;
select * from quizzes;
select * from questions;
select * from lessons;

CREATE OR REPLACE FUNCTION public.modify_quiz(
    p_quiz_id uuid,
    p_quiz_title text,
    p_questions jsonb  -- array of question objects with optional question_id
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    q jsonb;
    a jsonb;
    v_question_id uuid;
BEGIN
    -- 1. Update quiz title
    UPDATE public.quizzes
    SET quiz_title = p_quiz_title
    WHERE quiz_id = p_quiz_id;

    -- 2. Loop over questions
    FOR q IN SELECT * FROM jsonb_array_elements(p_questions)
    LOOP
        -- If question_id exists, update question; else insert new question
        IF q ? 'question_id' THEN
            v_question_id := (q->>'question_id')::uuid;

            UPDATE public.questions
            SET question_text = q->>'question_text'
            WHERE question_id = v_question_id;

            -- Update answers
            FOR a IN SELECT * FROM jsonb_array_elements(q->'answers')
            LOOP
                IF a ? 'answer_id' THEN
                    UPDATE public.answers
                    SET answer_text = a->>'answer_text',
                        is_correct = coalesce((a->>'is_correct')::boolean,false)
                    WHERE answer_id = (a->>'answer_id')::uuid;
                ELSE
                    -- Insert new answer
                    INSERT INTO public.answers(question_id, answer_text, is_correct)
                    VALUES (v_question_id, a->>'answer_text', coalesce((a->>'is_correct')::boolean,false));
                END IF;
            END LOOP;
        ELSE
            -- New question
            INSERT INTO public.questions(quiz_id, question_text, question_type)
            VALUES (p_quiz_id, q->>'question_text', 'MCQ')
            RETURNING question_id INTO v_question_id;

            -- Insert answers for new question
            FOR a IN SELECT * FROM jsonb_array_elements(q->'answers')
            LOOP
                INSERT INTO public.answers(question_id, answer_text, is_correct)
                VALUES (v_question_id, a->>'answer_text', coalesce((a->>'is_correct')::boolean,false));
            END LOOP;
        END IF;
    END LOOP;
END;
$$;

select q.*, qu.question_id, ans.answer_id from quizzes q
join questions qu on qu.quiz_id = q.quiz_id
join answers ans on ans.question_id = qu.question_id;

select * from questions;

select * from quizzes;
select * from answers;
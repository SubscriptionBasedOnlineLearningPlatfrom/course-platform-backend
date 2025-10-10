-- Enrollment overview
create or replace view v_enrollment_overview as
SELECT
  c.instructor_id,
  s.student_id,
  s.username AS student_name,
  COUNT(e.*) AS total_enrollments,
  COALESCE(ROUND(AVG(e.progress)::numeric, 2), 0) AS completion_rate,
  COALESCE(SUM((e.completion_date IS NOT NULL OR e.progress >= 100)::int), 0) AS certificates_issued
FROM public.students s
JOIN public.enrollments e ON e.student_id = s.student_id
JOIN public.courses c     ON c.course_id   = e.course_id
GROUP BY c.instructor_id, s.student_id, s.username;

SELECT * FROM public.v_enrollment_overview;

-- view created courses
create or replace view v_created_courses as
SELECT 
  instructor_id,
  course_id,
  course_title,
  course_description,
  category,
  created_at,
  updated_at
FROM courses;

DROP VIEW IF EXISTS public.v_created_courses;

SELECT * FROM v_created_courses;


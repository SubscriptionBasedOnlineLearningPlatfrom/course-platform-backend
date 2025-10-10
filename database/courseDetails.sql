create or replace view public.course_details as
select 
  c.course_id,
  c.course_title,
  c.course_description,
  c.category,
  c.language,
  c.rating,
  c.created_at,
  c.updated_at,
  i.username as instructor_name
from public.courses c
join public.instructors i on i.instructor_id = c.instructor_id;

select * from course_details;

create or replace view public.modules_lessons as
select 
  course_id,
  module_id,
  module_title,
  module_order
from public.modules
order by module_order;

select * from modules_lessons;

drop view course_lessons_connected_by_modules;

create or replace view public.course_lessons_connected_by_modules as
select 
q.quiz_id,
  l.lesson_id,
  m.module_id,
  c.course_id
from lessons l 
left join quizzes q on q.lesson_id = l.lesson_id
join modules m on l.module_id = m.module_id
join courses c on c.course_id = m.course_id;

select * from course_lessons_connected_by_modules
where course_id = 'e7e33c46-b7ca-4fa8-aecf-f9f8ebe7fb3b';

select * from quizzes;
--get related courses
create or replace view relatedCourses as
select 
  c.course_id,
  c.course_title,
  c.course_description,
  c.category,
  i.username as instructor_name,
  i.
  c.rating,
  c.updated_at,
  count(*)
from courses c
join enrollments e on e.course_id = c.course_id
join instructors i on i.instructor_id = c.instructor_id
group by c.course_id,i.instructor_id;


select * from relatedCourses;


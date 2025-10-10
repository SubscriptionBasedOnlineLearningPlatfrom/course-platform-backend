-- DROP VIEW public.students_comments_for_instructor;
-- view comments for instructor
create or replace view public.students_comments_for_instructor as
select
  comments.comment_id,
  comments.course_id,
  instructors.instructor_id,
  courses.course_title,
  students.username,
  courses.rating,
  comments.comment_text,
  comments.comment_date
from public.comments comments
join public.students students on students.student_id = comments.student_id
join courses courses on courses.course_id = comments.course_id
join instructors instructors on courses.instructor_id = instructors.instructor_id;

select * from students_comments_for_instructor;

create or replace view public.instructor_replies_for_comments as
select 
  replies.reply_id,
  replies.comment_id,
  replies.instructor_id,
  instructors.username,
  replies.reply_text,
  replies.created_at,
  replies.updated_at
from public.instructor_replies replies
join public.instructors instructors on instructors.instructor_id = replies.instructor_id;

select * from instructor_replies_for_comments;

drop view student_comments;
--extract comments
create or replace view student_comments as
select 
  c.*,
  s.username as student_name,
  s.user_profile
from comments c
join students s on s.student_id = c.student_id;

--replies that is replied by students
drop view student_comment_replies;
create or replace view student_comment_replies as
select 
  c.*,
  s.username as student_name,
  s.user_profile
from comment_replies c
join students s on s.student_id = c.student_id;

-- instructor replies for student;s comments
drop view instructor_replies_for_student_comments;
create or replace view instructor_replies_for_student_comments as
select 
  ir.* ,
  i.username as instructor_name
from instructor_replies ir
join instructors i on i.instructor_id = ir.instructor_id ;

select * from students;
select * from comments;
select * from student_comments;
select * from comment_replies;

select * from instructors;
select * from courses;

select * from instructor_replies;

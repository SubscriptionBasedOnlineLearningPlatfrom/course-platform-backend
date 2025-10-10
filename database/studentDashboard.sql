--Dashboard for students


create or replace view public.student_dashboard as
select
  e.student_id,
  count(*)                                           as enrolled_count,
  count(*) filter (where e.progress > 0 and e.progress < 100) as in_progress_count,
  count(*) filter (where e.completion_date is not null or e.progress = 100) as certificates_count
from public.enrollments e
group by e.student_id;

select * from student_dashboard;


--get current streak
create or replace function public.get_current_streak(p_student uuid)
returns integer
language sql
stable
as $$
with d as (
  select distinct submission_date::date as d
  from public.submissions
  where student_id = p_student
),
-- keep only dates up to TODAY (UTC::date).
dx as (
  select d
  from d
  where d <= (now() at time zone 'UTC')::date
),
-- build islands
t as (
  select
    d,
    d - (row_number() over(order by d))::int as grp
  from dx
),
groups as (
  select min(d) as start_d, max(d) as end_d
  from t
  group by grp
),
current_island as (
  select *
  from groups
  where end_d = (now() at time zone 'UTC')::date
)
select
  case
    when exists(select 1 from current_island)
      then (select (end_d - start_d + 1) from current_island)::int
    else 0
  end;
$$;

--enrolled course details
drop view enrolledCourseDetails;
create or replace view public.enrolledCourseDetails as
select 
  e.student_id,
  c.course_id,
  c.course_title,
  c.course_description,
  c.category,
  i.username as instructor_name,
  e.progress,
  e.completion_date,
  e.updated_at
from enrollments e
left join courses c on c.course_id = e.course_id
left join instructors i on c.instructor_id = i.instructor_id;

select * from payments;

select * from enrolledCourseDetails;

select * from enrollments;

select * from submissions;




import { supabase } from "../../config/supabaseClient.js";

export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      course_id,
      course_title,
      level,
      created_at,
      instructor:instructor_id(username),
      enrollments:enrollments(course_id)
    `);

  if (error) throw error;

  const courses = data.map((course) => ({
    id: course.course_id,
    name: course.course_title,
    instructor: course.instructor.username,
    level: course.level,
    students: course.enrollments.length, // count of enrollments
    dateCreated: course.created_at,
  }));

  return courses;
};


export const deleteCourse = async (courseId) => {
  const { data, error } = await supabase
    .from("courses")
    .delete()
    .eq("course_id", courseId);

  if (error) throw error;

  return data;
};

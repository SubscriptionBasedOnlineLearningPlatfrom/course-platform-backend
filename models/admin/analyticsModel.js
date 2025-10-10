import { supabase } from "../../config/supabaseClient.js";

//instructors bar graph
export const getInstructorEnrollments = async () => {
  const { data: instructors, error: instructorError } = await supabase
    .from("instructors")
    .select("instructor_id, username");

  if (instructorError) throw instructorError;

  const results = [];

  for (const instructor of instructors) {
    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("course_id")
      .eq("instructor_id", instructor.instructor_id);

    if (courseError) throw courseError;

    if (!courses || courses.length === 0) {
      results.push({ instructor: instructor.username, courses: 0 });
      continue;
    }

    // For each course, count enrollments
    let totalEnrollments = 0;
    for (const course of courses) {
      const { count, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*", { count: "exact" })
        .eq("course_id", course.course_id);

      if (enrollmentError) throw enrollmentError;
      totalEnrollments += count;
    }
    results.push({ instructor: instructor.username, courses: totalEnrollments });
  }

  results.sort((a, b) => b.courses - a.courses);
  return results.slice(0, 10);
};


//overall analytics bar graph
export const getOverallAnalytics = async () => {
  const { count: studentCount, error: studentError } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });
  if (studentError) throw studentError;

  const { count: instructorCount, error: instructorError } = await supabase
    .from("instructors")
    .select("*", { count: "exact", head: true });
  if (instructorError) throw instructorError;

  const { count: courseCount, error: courseError } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });
  if (courseError) throw courseError;

  return [
    { name: "Students", value: studentCount },
    { name: "Instructors", value: instructorCount },
    { name: "Courses", value: courseCount },
  ];
};


//pie chart
export const getStudentActivityData = async () => {
  try {
    //call sql function
    const { data, error } = await supabase.rpc("get_student_activity_buckets");

    if (error) throw error;

    return data.map((row) => ({
      name: row.bucket,
      value: row.value,
    }));
  } catch (err) {
    console.error("Error fetching student activity data:", err);
    return [];
  }
};


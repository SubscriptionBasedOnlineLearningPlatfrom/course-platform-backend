import { supabase } from "../../config/supabaseClient.js";

//fetch top 10 courses by rating
export const getHighestRatedCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('course_title, rating')
    .order('rating', { ascending: false }) 
    .limit(10); 

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return data; 
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


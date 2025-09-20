import {supabase} from "../config/supabaseClient.js";

// Fetch all courses
export const getAllCourses = async () => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) throw error;
  return data;
};



// Create a new course

//get course details by courseId
export const courseDetailsByCourseId = async (courseId) => {
    const { data: course, error: courseError } = await supabase
        .from("course_details")
        .select("*")
        .eq("course_id", courseId)
        .single();

    if (courseError) {
        return res.status(500).json({ error: courseError });
    }

    const { data: modules, error: modulesError } = await supabase
        .from("modules_lessons")
        .select('*')
        .eq("course_id", courseId)
        .order("module_order", { ascending: true })

    if (modulesError) {
        return res.status(500).json({ error: modulesError });
    }
    return { course, modules };
}



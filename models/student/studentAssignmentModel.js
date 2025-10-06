import { supabase } from "../../config/supabaseClient.js";

//save submission 
export const saveSubmission = async (courseId, studentId, fileUrl) => {
  const { data, error } = await supabase
    .from("student_assignments")
    .insert([
      {
        course_id: courseId,
        student_id: studentId,
        assignment_url: fileUrl,
        grade: null,
        created_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

//get all submissions
export const getSubmissionsByStudent = async (courseId, studentId) => {
  const { data, error } = await supabase
    .from("student_assignments")
    .select("*")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

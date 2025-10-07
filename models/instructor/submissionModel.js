import { supabase } from '../../config/supabaseClient.js';

//all submissions for a specific course
export const getSubmissionsByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from("student_assignments")
    .select(`
      id,
      student_id,
      assignment_url,
      grade,
      students:students(username)
    `)
    .eq("course_id", courseId);

  if (error) throw new Error(error.message);

  return data.map((item) => {
    const urlParts = item.assignment_url.split("/");
    const fileName = urlParts[urlParts.length - 1].split("-").slice(1).join("-");
    return {
      id: item.id,                
      studentName: item.students.username,
      fileName: fileName,
      grade: item.grade || "",
    };
  });
};

//update grade for a submission
export const updateSubmissionGrade = async (submissionId, grade) => {
  const { data, error } = await supabase
    .from("student_assignments")
    .update({ grade })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

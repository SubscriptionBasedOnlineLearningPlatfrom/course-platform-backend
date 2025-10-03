import { supabase } from "../../config/supabaseClient.js";

export async function createCourseProgress(studentId, courseId) {
  //get all modules for the given course
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("module_id")
    .eq("course_id", courseId);

  if (modulesError) throw modulesError;
  if (!modules || modules.length === 0) throw new Error("No modules found for this course");

  // build progress records
  const progressRecords = modules.map((m) => ({
    student_id: studentId,
    course_id: courseId,
    module_id: m.module_id,
    is_completed: false,
  }));

  // insert into course_progress
  const { data, error } = await supabase
    .from("course_progress")
    .insert(progressRecords);

  if (error) throw error;
  return data;
}


//Update the progress of a module for a student
export async function updateProgress(studentId, moduleId, isCompleted) {
  const { data, error } = await supabase
    .from("course_progress")
    .update({ 
      is_completed: isCompleted,
      updated_at: new Date().toISOString() // update date
    })
    .eq("student_id", studentId)
    .eq("module_id", moduleId)
    .single();

  if (error) throw error;
  return data;
}


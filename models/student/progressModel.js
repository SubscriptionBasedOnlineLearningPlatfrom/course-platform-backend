import { supabase } from "../../config/supabaseClient.js";

export async function createCourseProgress(studentId, courseId) {
  // get all modules for the given course
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("module_id")
    .eq("course_id", courseId);

  if (modulesError) throw modulesError;
  if (!modules || modules.length === 0) throw new Error("No modules found for this course");

  // get existing progress for this student + course
  const { data: existingProgress, error: existingError } = await supabase
    .from("course_progress")
    .select("module_id")
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  if (existingError) throw existingError;

  const existingModuleIds = existingProgress?.map(p => p.module_id) || [];

  // filter modules that are not already in progress table
  const newProgressRecords = modules
    .filter(m => !existingModuleIds.includes(m.module_id))
    .map(m => ({
      student_id: studentId,
      course_id: courseId,
      module_id: m.module_id,
      is_completed: false,
    }));

  if (newProgressRecords.length === 0) {
    //all modules already have progress rows
    return { message: "Progress already initialized for all modules" };
  }

  //insert missing progress records
  const { data, error } = await supabase
    .from("course_progress")
    .insert(newProgressRecords);

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


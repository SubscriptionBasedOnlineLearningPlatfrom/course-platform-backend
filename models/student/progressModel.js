import { supabase } from "../../config/supabaseClient.js";

export async function createCourseProgress(studentId, courseId) {
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("module_id")
    .eq("course_id", courseId);

  if (modulesError) throw modulesError;
  if (!modules || modules.length === 0) throw new Error("No modules found for this course");

  //get existing progress for this student + course
  const { data: existingProgress, error: existingError } = await supabase
    .from("course_progress")
    .select("module_id")
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  if (existingError) throw existingError;

  const existingModuleIds = existingProgress?.map(p => p.module_id) || [];

  //filter modules that are not already in progress table
  const newProgressRecords = modules
    .filter(m => !existingModuleIds.includes(m.module_id))
    .map(m => ({
      student_id: studentId,
      course_id: courseId,
      module_id: m.module_id,
      is_completed: false,
    }));

  if (newProgressRecords.length === 0) {
    return { message: "Progress already initialized for all modules" };
  }

  //insert missing progress records
  const { data, error } = await supabase
    .from("course_progress")
    .insert(newProgressRecords);

  if (error) throw error;
  return data;
}


//update the progress of a module for a student
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



// fetch progress for a student in a course
export async function getCourseProgress(studentId, courseId) {
  //fetch student username
  const { data: studentData, error: studentError } = await supabase
    .from("students")
    .select("username")
    .eq("student_id", studentId)
    .single();

  if (studentError) throw new Error(studentError.message);

  //fetch course title
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("course_title")
    .eq("course_id", courseId)
    .single();

  if (courseError) throw new Error(courseError.message);

  //get all modules for the course
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("module_id, module_title")
    .eq("course_id", courseId);

  if (modulesError) throw new Error(modulesError.message);

  //get student's progress records
  const { data: progress, error: progressError } = await supabase
    .from("course_progress")
    .select("module_id, is_completed, updated_at")
    .eq("course_id", courseId)
    .eq("student_id", studentId);

  if (progressError) throw new Error(progressError.message);

  //detect missing modules
  const progressModuleIds = progress.map((p) => p.module_id);
  const missingModules = modules.filter(
    (m) => !progressModuleIds.includes(m.module_id)
  );

  //insert missing records into course_progress
  if (missingModules.length > 0) {
    const inserts = missingModules.map((m) => ({
      course_id: courseId,
      student_id: studentId,
      module_id: m.module_id,
      is_completed: false,
      updated_at: null,
    }));

    const { error: insertError } = await supabase
      .from("course_progress")
      .insert(inserts);

    if (insertError) throw new Error(insertError.message);

    //re-fetch updated progress
    const { data: refreshed, error: refreshedError } = await supabase
      .from("course_progress")
      .select("module_id, is_completed, updated_at")
      .eq("course_id", courseId)
      .eq("student_id", studentId);

    if (refreshedError) throw new Error(refreshedError.message);
    progress.splice(0, progress.length, ...refreshed); // overwrite old array
  }

  //build final array
  const modulesWithProgress = modules.map((m) => {
    const found = progress.find((p) => p.module_id === m.module_id);
    return {
      id: m.module_id,
      name: m.module_title,
      completed: found ? found.is_completed : false,
      dateCompleted: found && found.is_completed ? found.updated_at : null,
    };
  });

  return {
    studentName: studentData.username,
    courseTitle: courseData.course_title,
    modules: modulesWithProgress,
  };
}

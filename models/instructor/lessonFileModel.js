import {supabase} from "../../config/supabaseClient.js";

//save video URL
export const saveVideoUrl = async (lessonId, url) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({ video_url: url })
    .eq("lesson_id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

//save note URL
export const saveNoteUrl = async (lessonId, url) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({ note_url: url })
    .eq("lesson_id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

//save assignment URL
export const saveAssignmentUrl = async (lessonId, url) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({ assignment_url: url })
    .eq("lesson_id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

//get a lesson by ID for resources
export const getLessonById = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("lesson_id", lessonId)
    .single();

  if (error) throw error;
  return data;
};

//set a specific resource column (video_url / note_url / assignment_url) to NULL
export const updateLessonResource = async (lessonId, column) => {
  const { error } = await supabase
    .from("lessons")
    .update({ [column]: null })
    .eq("lesson_id", lessonId);

  if (error) throw error;
};
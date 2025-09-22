import {supabase} from "../../config/supabaseClient.js";

//Save video URL
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

// Save note URL
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

// Save assignment URL
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
